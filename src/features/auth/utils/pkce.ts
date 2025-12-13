/**
 * PKCE (Proof Key for Code Exchange) utility functions
 * Used for OAuth 2.0 authorization code flow with PKCE
 */

/**
 * Generate a cryptographically random string
 * @param length Length of the random string
 * @returns Random string
 */
function generateRandomString(length: number): string {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], '')
}

/**
 * Generate SHA-256 hash of a plain text string
 * @param plain Plain text to hash
 * @returns Promise resolving to ArrayBuffer of hashed data
 */
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

/**
 * Encode ArrayBuffer to base64url format (RFC 4648 § 5)
 * @param buffer ArrayBuffer to encode
 * @returns Base64url encoded string
 */
function base64urlencode(buffer: ArrayBuffer): string {
  let str = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength as number
  for (let i = 0; i < len; i++) {
    const byte = bytes[i]
    if (byte !== undefined) {
      str += String.fromCharCode(byte)
    }
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Generate PKCE code challenge from code verifier
 * @param codeVerifier Code verifier string
 * @returns Promise resolving to code challenge
 */
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const hashed = await sha256(codeVerifier)
  return base64urlencode(hashed)
}

/**
 * Generate a complete PKCE flow data
 * @returns PKCE data including code verifier, challenge, and state
 */
export async function generatePKCEData(): Promise<{
  codeVerifier: string
  codeChallenge: string
  state: string
}> {
  const codeVerifier = generateRandomString(64)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(16)

  return { codeVerifier, codeChallenge, state }
}
