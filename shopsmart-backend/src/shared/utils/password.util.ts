import * as argon2 from 'argon2';

/**
 * Single place the password hashing algorithm/cost factor is defined
 * (Backend Standards Section 16 / SEC-001). No module should call argon2
 * directly — always go through these two functions.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
  return argon2.verify(hash, plainPassword);
}
