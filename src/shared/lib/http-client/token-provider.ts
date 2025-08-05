// Token provider interface for API client
// This allows the API client to access tokens without depending on features layer

export interface TokenProvider {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
  clearTokens: () => void
}

// Global token provider instance
let tokenProvider: TokenProvider | null = null

export function setTokenProvider(provider: TokenProvider) {
  tokenProvider = provider
}

export function getTokenProvider(): TokenProvider | null {
  return tokenProvider
}
