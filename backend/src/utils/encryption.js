import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const getEncryptionKey = () => {
  const masterKey = process.env.MASTER_KEY;

  if (!masterKey || masterKey.length < 32) {
    throw new Error('MASTER_KEY must be configured and at least 32 characters long.');
  }

  // Hashing creates the exact 32-byte key AES-256 requires without storing a
  // derived key anywhere outside the running process.
  return crypto.createHash('sha256').update(masterKey, 'utf8').digest();
};

/**
 * Encrypts a string using AES-256-GCM.
 * @param {string} text - The plaintext to encrypt.
 * @returns {{encrypted: string, iv: string, authTag: string}} - The encrypted data, IV, and auth tag.
 */
export const encrypt = (text) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
};

/**
 * Decrypts an AES-256-GCM encrypted string.
 * @param {string} encrypted - The encrypted hex string.
 * @param {string} iv - The initialization vector hex string.
 * @param {string} authTag - The auth tag hex string.
 * @returns {string} - The decrypted plaintext.
 */
export const decrypt = (encrypted, iv, authTag) => {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
