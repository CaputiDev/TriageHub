import { randomUUID } from 'crypto';
import { User } from '../entities/User.js';

export class AuthenticateUser {
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute({ email, password, firstName, lastName, role, funcao, isSignUp }) {
    if (!email || !password) {
      throw new Error('Dados de autenticação incompletos.');
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (isSignUp) {
      if (existingUser) {
        throw new Error('Este e-mail já está cadastrado. Por favor, faça login.');
      }

      if (!firstName || !lastName || !role) {
        throw new Error('Por favor, preencha todos os campos para realizar o cadastro.');
      }

      if (role === 'agent' && !funcao) {
        throw new Error('Por favor, selecione a sua função de atendente.');
      }

      const name = `${firstName.trim()} ${lastName.trim()}`;
      const passwordHash = await this.passwordHasher.hash(password);
      const userId = randomUUID();

      await this.userRepository.create({ id: userId, email, name, passwordHash, role });

      let code = '';
      if (role === 'agent') {
        let isUnique = false;
        while (!isUnique) {
          code = User.generateAgentCode();
          const existingAgent = await this.userRepository.findAgentByCode(code);
          if (!existingAgent) {
            isUnique = true;
          }
        }

        await this.userRepository.createAgent({ userId, funcao, codigoIdentificacao: code });
        console.log(`🔒 Novo atendente cadastrado: ${name} (${funcao}) | Código: ${code}`);
      } else {
        console.log(`🔒 Novo usuário cadastrado: ${name} (${role})`);
      }

      return {
        user: { id: userId, name, role, email },
        extraDetails: role === 'agent' ? { funcao, codigoIdentificacao: code } : {},
        isSignUp: true
      };

    } else {
      // LOGIN
      if (!existingUser) {
        throw new Error('Este e-mail não está cadastrado. Por favor, realize o cadastro.');
      }

      const passwordMatch = await this.passwordHasher.verify(existingUser.passwordHash, password);
      if (!passwordMatch) {
        throw new Error('Senha incorreta. Por favor, tente novamente.');
      }

      console.log(`🔒 Login efetuado com sucesso: ${existingUser.name} (${existingUser.role})`);

      let extraDetails = {};
      if (existingUser.role === 'agent') {
        const agentDetails = await this.userRepository.findAgentByUserId(existingUser.id);
        let funcao = agentDetails?.funcao || 'suporte_ti_1';
        let codigoIdentificacao = agentDetails?.codigoIdentificacao;

        if (!codigoIdentificacao) {
          let isUnique = false;
          while (!isUnique) {
            codigoIdentificacao = User.generateAgentCode();
            const existingAgent = await this.userRepository.findAgentByCode(codigoIdentificacao);
            if (!existingAgent) {
              isUnique = true;
            }
          }
          await this.userRepository.createAgent({ userId: existingUser.id, funcao, codigoIdentificacao });
        }

        // 1. Grava log de acesso na tabela dedicada de atendentes
        const logId = randomUUID();
        const timestamp = new Date().toISOString();
        await this.userRepository.createAgentAccessLog({ id: logId, userId: existingUser.id, timestamp });

        // 2. Limita os logs de acessos a no máximo os 50 mais recentes
        const logs = await this.userRepository.getAgentAccessLogs(existingUser.id);
        if (logs.length > 50) {
          for (const oldestLog of logs.slice(50)) {
            await this.userRepository.deleteAgentAccessLog(oldestLog.id);
          }
        }

        extraDetails = { funcao, codigoIdentificacao };
      }

      return {
        user: { id: existingUser.id, name: existingUser.name, role: existingUser.role, email: existingUser.email },
        extraDetails,
        isSignUp: false
      };
    }
  }
}
