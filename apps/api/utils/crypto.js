const crypto = require('crypto');

// AES-256-GCM encryption for sensitive data
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derives a key from the encryption key using PBKDF2
 * @param {string} password - The encryption key from environment
 * @param {Buffer} salt - Salt for key derivation
 * @returns {Buffer} Derived key
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Encrypts a string value
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text in format: salt:iv:encrypted:tag
 */
function encrypt(text) {
  if (!text) return '';
  
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(encryptionKey, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Return format: salt:iv:encrypted:tag (all in hex)
  return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
}

/**
 * Decrypts an encrypted string
 * @param {string} encryptedData - Encrypted data in format: salt:iv:encrypted:tag
 * @returns {string} Decrypted text
 */
function decrypt(encryptedData) {
  if (!encryptedData) return '';
  
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }

    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const tag = Buffer.from(parts[3], 'hex');

    const key = deriveKey(encryptionKey, salt);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Encrypts an array of strings
 * @param {string[]} items - Array of strings to encrypt
 * @returns {string[]} Array of encrypted strings
 */
function encryptArray(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => encrypt(item));
}

/**
 * Decrypts an array of encrypted strings
 * @param {string[]} encryptedItems - Array of encrypted strings
 * @returns {string[]} Array of decrypted strings
 */
function decryptArray(encryptedItems) {
  if (!Array.isArray(encryptedItems)) return [];
  return encryptedItems.map(item => decrypt(item));
}

/**
 * Generates a random encryption key (for initial setup)
 * @returns {string} Random 64-character hex string
 */
function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  encrypt,
  decrypt,
  encryptArray,
  decryptArray,
  generateEncryptionKey,
};
