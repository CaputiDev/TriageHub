# 🏗️ Arquitetura e Estrutura de Diretórios - Backend (Servidor)

Este documento descreve a arquitetura baseada nos princípios de **Clean Architecture** (Arquitetura Limpa), a organização dos arquivos, o esquema relacional do banco de dados e o protocolo de comunicação via WebSockets do diretório `server` (backend) do **TriageHub**.

---

## 📁 Estrutura de Diretórios e Arquivos

O backend é desenvolvido em **Node.js** modularizado e utiliza **SQLite** para persistência, **Argon2** para hashing de segurança e **ws** para comunicação em tempo real via WebSockets.

A pasta `server/src` está estruturada em três camadas desacopladas com injeção de dependências:

```text
server/
├── src/
│   ├── core/                           # 1. CAMADA DOMAIN & BUSINESS LOGIC
│   │   ├── entities/
│   │   │   ├── Ticket.js               # Entidade Ticket e Algoritmo de Triagem de Estresse
│   │   │   └── User.js                 # Entidade User (Cliente e Operador)
│   │   ├── services/
│   │   │   └── NotificationService.js  # Contrato/Interface abstrata para envio de mensagens WS
│   │   └── usecases/                   # Casos de Uso (Fluxos de Execução da Aplicação)
│   │       ├── AcceptTicket.js         # Operador aceita um chamado
│   │       ├── AssignOrphanTickets.js   # Distribuição de chamados abertos para novos operadores
│   │       ├── AuthenticateUser.js     # Registo e validação de login (Argon2)
│   │       ├── CreateTicket.js         # Instanciação, triagem de IA e persistência do chamado
│   │       ├── DisconnectAgent.js      # Gerencia a desconexão de operadores e fila
│   │       ├── GetFullTickets.js       # Busca a lista completa de chamados para um usuário
│   │       ├── GetTicket.js            # Busca um chamado detalhado por UUID ou protocolo
│   │       ├── IdentifyUser.js         # Recupera a sessão no evento de reconexão do socket
│   │       ├── RejectTicket.js         # Operador recusa/devolve chamado para a fila
│   │       ├── ResolveTicket.js        # Finalização e resolução do atendimento
│   │       └── SendMessage.js          # Cadastro de mensagens no chat e reavaliação de estresse
│   ├── infrastructure/                 # 2. CAMADA INFRASTRUCTURE (Ferramentas externas e adaptadores)
│   │   ├── database/
│   │   │   ├── DatabaseConnection.js   # Conexão SQLite3 e scripts DDL das tabelas
│   │   │   └── SQLiteRepositories.js   # Implementações concretas de repositórios SQL
│   │   ├── security/
│   │   │   └── PasswordHasher.js       # Implementação concreta de hashing com Argon2 e Salt estático
│   │   └── websocket/
│   │       └── WSNotificationService.js # Disparador concreto de mensagens em tempo real via ws
│   └── presentation/                   # 3. CAMADA PRESENTATION (Adaptadores de entrada da rede)
│       └── websocket/
│           ├── WSController.js         # Roteador de eventos WebSocket recebidos do cliente
│           └── WSServer.js             # Inicialização do Servidor WebSocket na porta 8080
├── server.js                           # Entry point da aplicação (Instanciação e Injeção de dependências)
└── package.json                        # Dependências e scripts do servidor
```

---

## 🛠️ Detalhes das Camadas e Casos de Uso

### 1. Camada Core (Domain)
Contém as regras de negócio puras e workflows de transações:
* **[Ticket.js](file:///d:/git_clones/TriageHub/server/src/core/entities/Ticket.js)**:
  * Armazena os atributos fundamentais do ticket.
  * Contém o método estático `realizarTriagem(description)`, que atua como o **motor de triagem**. Ele verifica a presença de palavras-chave críticas (ex: *cancelar*, *procon*, *urgente*, *ruim*, *advogado*). Se encontradas, eleva o nível de estresse a 5 e atribui prioridade `critical` ou `high` de forma probabilística. Caso contrário, define estresse de 1 a 3 e prioridade `medium` ou `low`.
* **Usecases**:
  * `CreateTicket`: Realiza a triagem do relato, persiste o ticket, insere uma mensagem inicial do bot no histórico de mensagens do chamado, cria o primeiro log na tabela de auditoria (`ticket_logs`) e sinaliza a atualização para todos os operadores online.
  * `SendMessage`: Insere o registro de mensagem, mas também executa uma triagem reativa no conteúdo de texto da mensagem. Se o cliente demonstrar estresse durante a conversa, o nível de estresse do ticket é atualizado em tempo real no banco, e um log de triagem de estresse prioritário é adicionado, alertando os operadores.

### 2. Camada Infrastructure
Lida com a persistência de banco de dados e APIs externas:
* **[DatabaseConnection.js](file:///d:/git_clones/TriageHub/server/src/infrastructure/database/DatabaseConnection.js)**:
  * Gerencia o ciclo de conexão com o banco de dados local SQLite (`support.db`).
  * Executa a checagem automática e migração simples de tabelas caso o esquema do banco de dados relacional esteja desatualizado.
  * Garante a inserção do `system_bot` na tabela de usuários para centralizar as mensagens automáticas de sistema.
* **[SQLiteRepositories.js](file:///d:/git_clones/TriageHub/server/src/infrastructure/database/SQLiteRepositories.js)**:
  * Fornece os métodos concretos do banco de dados (Repository Pattern) utilizando queries preparadas do SQLite. Divide-se em:
    * `SQLiteUserRepository`: Acesso a perfis de usuário, agentes e logs de acessos.
    * `SQLiteTicketRepository`: Criação, leitura e atualizações de status/operador de chamados.
    * `SQLiteMessageRepository`: Recuperação e gravação do histórico de chat.
    * `SQLiteTicketLogRepository`: Logs de auditoria do ciclo de vida e triagem.
* **[PasswordHasher.js](file:///d:/git_clones/TriageHub/server/src/infrastructure/security/PasswordHasher.js)**:
  * Utiliza a biblioteca segura **Argon2** para criar hashes criptográficos fortes de senhas, mitigando ataques de dicionário e rainbow tables.
* **[WSNotificationService.js](file:///d:/git_clones/TriageHub/server/src/infrastructure/websocket/WSNotificationService.js)**:
  * Implementa a interface abstrata de notificações.
  * Envia atualizações de tickets em tempo real para os clientes proprietários, para o operador associado ou para todos os operadores online caso o ticket esteja órfão.

### 3. Camada Presentation
* **[WSController.js](file:///d:/git_clones/TriageHub/server/src/presentation/websocket/WSController.js)**:
  * Ponto de entrada de rede WebSocket.
  * Interpreta mensagens JSON cruas, mapeia o campo `type` para executar o respectivo caso de uso do domínio e envia retornos em formato JSON estruturado.
* **[WSServer.js](file:///d:/git_clones/TriageHub/server/src/presentation/websocket/WSServer.js)**:
  * Wrapper da biblioteca nativa `ws` que configura a porta TCP 8080 para receber conexões.

---

## 🗄️ Esquema Relacional do Banco de Dados (SQLite)

O banco de dados é composto por 6 tabelas principais:

```mermaid
erDiagram
    USERS {
        TEXT id PK
        TEXT email UNIQUE
        TEXT name
        TEXT passwordHash
        TEXT role
    }
    AGENTS {
        TEXT userId PK, FK
        TEXT funcao
        TEXT codigoIdentificacao UNIQUE
    }
    AGENT_ACCESS_LOGS {
        TEXT id PK
        TEXT userId FK
        TEXT timestamp
    }
    TICKETS {
        TEXT id PK
        TEXT customerId FK
        TEXT channel
        TEXT category
        TEXT subject
        TEXT description
        TEXT priority
        TEXT status
        INTEGER stressLevel
        TEXT operatorId FK
        TEXT createdAt
    }
    MESSAGES {
        TEXT id PK
        TEXT ticketId FK
        TEXT senderId FK
        TEXT text
        TEXT timestamp
    }
    TICKET_LOGS {
        TEXT id PK
        TEXT ticketId FK
        TEXT text
        TEXT timestamp
    }

    USERS ||--o| AGENTS : "especifica"
    AGENTS ||--o{ AGENT_ACCESS_LOGS : "registra"
    USERS ||--o{ TICKETS : "abre"
    USERS ||--o{ TICKETS : "atende"
    TICKETS ||--o{ MESSAGES : "contem"
    USERS ||--o{ MESSAGES : "envia"
    TICKETS ||--o{ TICKET_LOGS : "audita"
```

### Detalhamento das Tabelas

1. **`users`**: Armazena credenciais e tipos de usuário.
   * `role`: `'client'`, `'agent'` ou `'system'`.
2. **`agents`**: Extensão de `users` contendo metadados de operadores.
   * `funcao`: Especialidade do operador.
   * `codigoIdentificacao`: Código único do atendente para verificação.
3. **`agent_access_logs`**: Auditoria de conexões de operadores.
4. **`tickets`**: Informações de chamados criados.
   * `priority`: `'low'`, `'medium'`, `'high'`, `'critical'`.
   * `status`: `'open'`, `'in_progress'`, `'resolved'`.
   * `stressLevel`: Inteiro de 1 a 5.
5. **`messages`**: Registro histórico de mensagens enviadas.
6. **`ticket_logs`**: Logs das atualizações do ticket e da triagem inteligente.

---

## 📡 Protocolo de Comunicação WebSocket (API do Contrato)

Toda a interação cliente-servidor segue o padrão de mensagem JSON:
```json
{
  "type": "NOME_DO_EVENTO",
  "data": { ... },     // Dados de envio/retorno
  "error": "..."        // Presente em eventos de erro
}
```

### Eventos Enviados pelo Cliente para o Servidor

| Evento | Payload (`data`) | Descrição |
| :--- | :--- | :--- |
| **`AUTH`** | `{ email, password, firstName, lastName, role, funcao, isSignUp }` | Efetua login ou cria nova conta de usuário. |
| **`IDENTIFY`** | `{ id, name, role, email }` | Reconecta e reatribui a sessão após perda de conexão. |
| **`CREATE_TICKET`** | `{ customerName, customerEmail, channel, category, subject, description }` | Solicita abertura de um novo chamado no sistema. |
| **`SEND_MESSAGE`** | `{ ticketId, sender, text }` | Envia mensagem no chat de um chamado ativo. |
| **`RESOLVE_TICKET`** | `{ ticketId }` | Finaliza e fecha o chamado como resolvido. |
| **`GET_TICKET`** | `{ ticketId }` | Requisita a busca detalhada de um chamado. |
| **`ACCEPT_TICKET`** | `{ ticketId }` | Atendente aceita atender o chamado órfão. |
| **`REJECT_TICKET`** | `{ ticketId }` | Atendente rejeita chamado, devolvendo-o para a fila. |

### Eventos Enviados pelo Servidor para o Cliente

| Evento | Payload (`data`) | Descrição |
| :--- | :--- | :--- |
| **`AUTH_SUCCESS`** | `{ id, email, name, role, funcao, codigoIdentificacao }` | Confirmação de autenticação bem-sucedida. |
| **`AUTH_ERROR`** | `N/A` (Envia o erro em `error`) | Informa falha nas credenciais ou no cadastro de usuário. |
| **`INITIAL_STATE`** | `[ Ticket, Ticket, ... ]` | Envia todos os tickets pertinentes ao escopo do usuário atual conectado. |
| **`TICKET_CREATED`** | `{ Ticket }` | Confirmação de criação bem-sucedida do chamado para o cliente. |
| **`TICKET_UPDATE`** | `{ Ticket }` (pode vir com `triageLog`) | Envia atualização de estado do ticket e log de triagem. |
| **`TICKET_ERROR`** | `N/A` (Envia o erro em `error`, pode incluir `ticketId`) | Informa falha ao processar ações em tickets. |
| **`REJECT_FAILED`** | `N/A` (Envia o erro em `error`) | Informa que a rejeição falhou (ex: o ticket já foi finalizado). |
