import argon2 from 'argon2';

export class PasswordHasher {
  constructor() {
    this.salt = Buffer.from("uvacomchocolatequente567890");
  }

  async hash(password) {
    return await argon2.hash(password, { salt: this.salt });
  }

  async verify(hash, password) {
    return await argon2.verify(hash, password);
  }
}
