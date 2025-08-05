/**
 * Shared stores public API
 * Provides access to global application state management
 */

// App store exports
export { useAppStore } from './app.store'

// Loading store exports
export {
  useLoadingStore,
  useLoading,
  useMultipleLoadings,
  useAsyncLoading,
  useGlobalLoading,
} from './loading.store'

// Preferences store exports
export { usePreferencesStore } from './preferences.store'

// Types (re-export types that should be available publicly)
export type { AppState, LoadingState, PreferencesState } from './app.store'
