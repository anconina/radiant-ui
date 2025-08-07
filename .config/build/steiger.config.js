import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Disable insignificant-slice rule
      // These slices are intentionally separated for future scalability and maintainability
      'fsd/insignificant-slice': 'off',
    },
  },
])