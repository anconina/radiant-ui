// Core authentication types used across the application

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  refreshExpiresIn: number
}

export interface DecodedToken {
  sub: string
  email?: string
  exp: number
  iat: number
  roles?: string[]
  permissions?: string[]
}
