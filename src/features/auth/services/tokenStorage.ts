import { TOKEN_EXPIRY_BUFFER_MS } from '@/shared/constants/auth'
import { STORAGE_KEYS } from '@/shared/constants/storage'

/**
 * Token data structure
 */
export interface TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/**
 * Token storage service - encapsulates all localStorage operations for OAuth tokens
 */
class TokenStorage {
  /**
   * Save token data to localStorage
   */
  save(data: TokenData): void {
    localStorage.setItem(STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN, data.accessToken)
    localStorage.setItem(STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN, data.refreshToken)
    localStorage.setItem(
      STORAGE_KEYS.SPOTIFY_TOKEN_EXPIRY,
      data.expiresAt.toString(),
    )
  }

  /**
   * Save token data from Spotify API response
   */
  saveFromResponse(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): TokenData {
    const expiresAt = Date.now() + expiresIn * 1000
    const data: TokenData = { accessToken, refreshToken, expiresAt }
    this.save(data)
    return data
  }

  /**
   * Get token data from localStorage
   */
  get(): TokenData | null {
    const accessToken = localStorage.getItem(STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN)
    const refreshToken = localStorage.getItem(
      STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
    )
    const expiryTime = localStorage.getItem(STORAGE_KEYS.SPOTIFY_TOKEN_EXPIRY)

    if (!accessToken || !refreshToken || !expiryTime) {
      return null
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: Number.parseInt(expiryTime, 10),
    }
  }

  /**
   * Get just the access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN)
  }

  /**
   * Clear all token data from localStorage
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.SPOTIFY_TOKEN_EXPIRY)
  }

  /**
   * Check if token is expired or will expire soon (within TOKEN_EXPIRY_BUFFER_MS)
   */
  isExpiringSoon(): boolean {
    const expiryTime = localStorage.getItem(STORAGE_KEYS.SPOTIFY_TOKEN_EXPIRY)
    if (!expiryTime) {
      return false
    }

    const expiryTimestamp = Number.parseInt(expiryTime, 10)
    return Date.now() >= expiryTimestamp - TOKEN_EXPIRY_BUFFER_MS
  }

  /**
   * Calculate time until token needs refresh (in milliseconds)
   * Returns 0 if token should be refreshed immediately
   */
  getTimeUntilRefresh(): number {
    const expiryTime = localStorage.getItem(STORAGE_KEYS.SPOTIFY_TOKEN_EXPIRY)
    if (!expiryTime) {
      return 0
    }

    const expiryTimestamp = Number.parseInt(expiryTime, 10)
    const timeUntilExpiry = expiryTimestamp - Date.now()
    return Math.max(0, timeUntilExpiry - TOKEN_EXPIRY_BUFFER_MS)
  }
}

// Singleton instance
export const tokenStorage = new TokenStorage()
