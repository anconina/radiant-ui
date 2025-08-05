import type { Plugin } from 'vite'

import { devSecurityHeaders } from '../src/shared/lib/security/headers'

export function securityHeadersPlugin(): Plugin {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Add security headers to all responses
        Object.entries(devSecurityHeaders).forEach(([header, value]) => {
          res.setHeader(header, value)
        })

        // Add CORS headers for API requests
        if (req.url?.startsWith('/api')) {
          res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
          res.setHeader('Access-Control-Allow-Credentials', 'true')
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
          res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-Requested-With'
          )

          // Handle preflight requests
          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
            return
          }
        }

        next()
      })
    },
  }
}
