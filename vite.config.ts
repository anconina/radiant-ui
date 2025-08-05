import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { securityHeadersPlugin } from './vite-plugins/security-headers'
import { imageOptimizationPlugin } from './vite-plugins/image-optimization'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    securityHeadersPlugin(),
    imageOptimizationPlugin({
      quality: 85,
      formats: ['webp', 'avif'],
      sizes: [640, 768, 1024, 1280, 1536],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React vendors
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor'
          }
          
          // UI utilities
          if (id.includes('class-variance-authority') || 
              id.includes('clsx') || 
              id.includes('tailwind-merge')) {
            return 'ui-utils'
          }
          
          // Radix UI components (separate chunks for better caching)
          if (id.includes('@radix-ui/')) {
            return 'radix-ui'
          }
          
          // Icons
          if (id.includes('lucide-react')) {
            return 'icons'
          }
          
          // Charts (heavy library, separate chunk)
          if (id.includes('recharts')) {
            return 'charts'
          }
          
          // React Query / TanStack Query
          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }
          
          // State management
          if (id.includes('zustand')) {
            return 'state'
          }
          
          // Date utilities
          if (id.includes('date-fns')) {
            return 'date-utils'
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform/')) {
            return 'forms'
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true,
  },
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['lucide-react'],
  },
})
