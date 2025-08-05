// API client public exports
export {
  fetchClient,
  apiClient,
  apiClient as api, // Legacy alias for backward compatibility
  configureFetchTokenManager as configureTokenManager,
  FetchError,
  type FetchRequestConfig,
} from './fetch-client'
export { setTokenProvider, getTokenProvider } from './token-provider'
export type { TokenProvider } from './token-provider'
