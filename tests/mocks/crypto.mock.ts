/**
 * Crypto Module Mock
 */

export const crypto = {
  randomBytes: jest.fn((size: number) => {
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }),

  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn((encoding: string) => {
      return 'mock-hash-digest';
    }),
  })),

  createHmac: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn((encoding: string) => {
      return 'mock-hmac-digest';
    }),
  })),

  createCipheriv: jest.fn(() => ({
    update: jest.fn((data: string) => data),
    final: jest.fn(() => ''),
  })),

  createDecipheriv: jest.fn(() => ({
    update: jest.fn((data: string) => data),
    final: jest.fn(() => ''),
  })),

  pbkdf2: jest.fn((password: string, salt: string, iterations: number, keylen: number, digest: string, callback: any) => {
    callback(null, Buffer.from('mock-derived-key'));
  }),

  pbkdf2Sync: jest.fn(() => {
    return Buffer.from('mock-derived-key');
  }),

  generateKeyPair: jest.fn((type: string, options: any, callback: any) => {
    callback(null, {
      publicKey: 'mock-public-key',
      privateKey: 'mock-private-key',
    });
  }),

  sign: jest.fn(() => 'mock-signature'),
  verify: jest.fn(() => true),

  randomUUID: jest.fn(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }),
};

export default crypto;
