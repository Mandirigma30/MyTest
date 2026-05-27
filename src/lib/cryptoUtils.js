/**
 * cryptoUtils.js — RespondaCare client-side encryption library
 * Uses native Web Crypto API (AES-256-GCM) as mandated by the blueprint.
 * No plaintext PII is ever written to storage per RA 10173 compliance.
 */

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Derives a CryptoKey from a password/PIN using PBKDF2.
 * @param {string} password - The auth key or PIN
 * @param {Uint8Array} salt - Random salt
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a JSON-serializable payload using AES-256-GCM.
 * @param {object} data - Plaintext data to encrypt
 * @param {string} password - Auth key or PIN for key derivation
 * @returns {Promise<string>} - Base64 encoded: salt + iv + ciphertext
 */
export async function encryptPayload(data, password) {
  const encoder = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const key = await deriveKey(password, salt);
  const plaintext = encoder.encode(JSON.stringify(data));

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  // Pack: salt(16) + iv(12) + ciphertext
  const packed = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  packed.set(salt, 0);
  packed.set(iv, salt.length);
  packed.set(new Uint8Array(ciphertext), salt.length + iv.length);

  // Return as base64 string (safe for QR encoding & database storage)
  return btoa(String.fromCharCode(...packed));
}

/**
 * Decrypts a payload encrypted by encryptPayload.
 * @param {string} base64Payload - The encrypted base64 string
 * @param {string} password - Auth key or PIN
 * @returns {Promise<object>} - Decrypted data object
 */
export async function decryptPayload(base64Payload, password) {
  const packed = Uint8Array.from(atob(base64Payload), (c) => c.charCodeAt(0));

  const salt = packed.slice(0, SALT_LENGTH);
  const iv = packed.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = packed.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(password, salt);

  const plaintext = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(plaintext));
}

/**
 * Generates a random shift auth key in RESP-XXXX-XXXX-XXXX format.
 * @returns {string}
 */
export function generateAuthKey() {
  const segment = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RESP-${segment()}-${segment()}-${segment()}`;
}
