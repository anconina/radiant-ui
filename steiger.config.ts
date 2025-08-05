import { defineConfig } from '@feature-sliced/steiger-plugin'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig({
  plugins: [fsd],
  // FSD-specific configuration
  rules: {
    // Import rules
    'fsd/no-cross-layer-imports': 'error',
    'fsd/no-layer-skip': 'error',
    'fsd/no-circular-imports': 'error',
    
    // Structure rules
    'fsd/layers-declaration': 'error',
    'fsd/segments-declaration': 'error',
    'fsd/public-api': 'error',
    
    // Naming rules
    'fsd/consistent-naming': 'warn',
    
    // Slice rules
    'fsd/no-slice-cross-imports': 'error',
    'fsd/no-segments-cross-imports': 'error',
  },
  // Layer configuration
  layers: {
    app: {
      segments: ['routes', 'providers', 'styles'],
    },
    pages: {
      segments: ['ui', 'api', 'model', 'lib'],
    },
    widgets: {
      segments: ['ui', 'api', 'model', 'lib'],
    },
    features: {
      segments: ['ui', 'api', 'model', 'lib'],
    },
    entities: {
      segments: ['ui', 'api', 'model', 'lib'],
    },
    shared: {
      segments: ['ui', 'api', 'lib', 'config', 'routes', 'types', 'providers', 'stores'],
    },
  },
  // Project-specific paths
  paths: {
    base: './src',
    layers: {
      app: 'app',
      pages: 'pages',
      widgets: 'widgets',
      features: 'features',
      entities: 'entities',
      shared: 'shared',
    },
  },
})