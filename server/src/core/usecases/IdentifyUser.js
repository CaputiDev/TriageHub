export class IdentifyUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ id, name, role, email }) {
    if (!role) {
      throw new Error('Role is required for identification.');
    }

    let userId = id;
    let userName = name;

    if (email && (!userId || !userName)) {
      const u = await this.userRepository.findByEmail(email);
      if (u) {
        userId = u.id;
        userName = u.name;
      }
    }

    if (!userId) {
      throw new Error('Could not identify user by provided information.');
    }

    return {
      id: userId,
      name: userName,
      role,
      email
    };
  }
}
