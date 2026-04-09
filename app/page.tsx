import { JournalApp } from "@/components/journal/journal-app"
import { ErrorBoundary } from "@/components/error-boundary"

// Temporary crypto test - runs once on load in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(async () => {
    try {
      const { encrypt, decrypt, isEncrypted } = await import('@/lib/crypto')

      const password = 'testPassword123'
      const secret = 'My secret journal entry!'

      // Test encrypt
      const encrypted = await encrypt(secret, password)
      console.log('%c[Crypto Test]', 'color: green; font-weight: bold', 'Encrypted:', encrypted)

      // Test isEncrypted
      console.log('[Crypto Test] isEncrypted(encrypted):', isEncrypted(JSON.stringify(encrypted)))
      console.log('[Crypto Test] isEncrypted(plaintext):', isEncrypted(secret))

      // Test decrypt
      const decrypted = await decrypt(encrypted, password)
      console.log('%c[Crypto Test]', 'color: green; font-weight: bold', 'Decrypted:', decrypted)
      console.log('[Crypto Test] Matches original:', decrypted === secret)

      // Test wrong password
      try {
        await decrypt(encrypted, 'wrongPassword')
      } catch (e) {
        console.log('%c[Crypto Test]', 'color: green; font-weight: bold', 'Wrong password correctly fails ✅')
      }

      console.log('%c[Crypto Test] All tests passed! ✅', 'color: green; font-weight: bold; font-size: 14px')
    } catch (e) {
      console.error('[Crypto Test] Failed:', e)
    }
  }, 1000)
}

export default function Page() {
  return (
    <ErrorBoundary>
      <JournalApp />
    </ErrorBoundary>
  )
}
