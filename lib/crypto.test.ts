/**
 * Simple tests for crypto functions
 * Run with: node --experimental-vm-modules node_modules/.bin/jest lib/crypto.test.ts
 * Or test in browser console
 */

import { encrypt, decrypt, isEncrypted } from './crypto'

describe('Crypto', () => {
  const password = 'mySecretPassword123'
  const plaintext = 'This is my secret journal entry!'

  test('encrypt produces encrypted data', async () => {
    const encrypted = await encrypt(plaintext, password)
    
    expect(encrypted).toHaveProperty('ciphertext')
    expect(encrypted).toHaveProperty('iv')
    expect(encrypted).toHaveProperty('salt')
    expect(typeof encrypted.ciphertext).toBe('string')
    expect(typeof encrypted.iv).toBe('string')
    expect(typeof encrypted.salt).toBe('string')
  })

  test('isEncrypted detects encrypted data', async () => {
    const encrypted = await encrypt(plaintext, password)
    const encryptedString = JSON.stringify(encrypted)
    
    expect(isEncrypted(encryptedString)).toBe(true)
    expect(isEncrypted(plaintext)).toBe(false)
    expect(isEncrypted('not encrypted')).toBe(false)
  })

  test('decrypt returns original text', async () => {
    const encrypted = await encrypt(plaintext, password)
    const decrypted = await decrypt(encrypted, password)
    
    expect(decrypted).toBe(plaintext)
  })

  test('decrypt with wrong password fails', async () => {
    const encrypted = await encrypt(plaintext, password)
    
    await expect(decrypt(encrypted, 'wrongPassword')).rejects.toThrow('Decryption failed')
  })

  test('different encryptions produce different ciphertexts', async () => {
    const encrypted1 = await encrypt(plaintext, password)
    const encrypted2 = await encrypt(plaintext, password)
    
    // Due to random IV and salt, ciphertexts should be different
    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext)
    expect(encrypted1.iv).not.toBe(encrypted2.iv)
    expect(encrypted1.salt).not.toBe(encrypted2.salt)
  })

  test('long text encryption works', async () => {
    const longText = 'A'.repeat(10000)
    const encrypted = await encrypt(longText, password)
    const decrypted = await decrypt(encrypted, password)
    
    expect(decrypted).toBe(longText)
  })
})
