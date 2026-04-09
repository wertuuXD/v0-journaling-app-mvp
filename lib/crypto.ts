/**
 * Client-side encryption utilities for journal entries
 * Uses AES-256-GCM for authenticated encryption
 * Keys are derived from user's password + salt
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for GCM
const SALT_LENGTH = 16

export interface EncryptedData {
  ciphertext: string
  iv: string
  salt: string
}

/**
 * Derive encryption key from password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveKey']
  )

  // Derive AES-GCM key using PBKDF2 with 100,000 iterations
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt text using password-derived key
 */
export async function encrypt(text: string, password: string): Promise<EncryptedData> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  // Derive key
  const key = await deriveKey(password, salt)

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data as BufferSource
  )

  // Return as base64 strings
  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
  }
}

/**
 * Decrypt data using password-derived key
 */
export async function decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
  try {
    const { ciphertext, iv, salt } = encryptedData

    // Decode base64
    const ciphertextBuffer = base64ToArrayBuffer(ciphertext)
    const ivBuffer = new Uint8Array(base64ToArrayBuffer(iv))
    const saltBuffer = new Uint8Array(base64ToArrayBuffer(salt))

    // Derive key
    const key = await deriveKey(password, saltBuffer)

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: ivBuffer },
      key,
      ciphertextBuffer
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    throw new Error('Decryption failed: invalid password or corrupted data')
  }
}

/**
 * Check if text appears to be encrypted (has our encrypted data structure)
 */
export function isEncrypted(text: string): boolean {
  try {
    const data = JSON.parse(text)
    return data && typeof data.ciphertext === 'string' &&
           typeof data.iv === 'string' &&
           typeof data.salt === 'string'
  } catch {
    return false
  }
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return typeof window !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = typeof window !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary')
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer as ArrayBuffer
}
