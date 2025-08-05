/**
 * Deployment configuration for multiple platforms
 */

export default {
  // Vercel deployment configuration
  vercel: {
    projectName: 'radiant-ui',
    framework: 'vite',
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    installCommand: 'npm ci',
    devCommand: 'npm run dev',
    regions: ['iad1'], // Washington D.C.
    environment: {
      NODE_VERSION: '20',
    },
    headers: [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
    ],
    rewrites: [
      {
        source: '/(.*)',
        destination: '/index.html',
      },
    ],
  },

  // Netlify deployment configuration
  netlify: {
    buildCommand: 'npm run build',
    publishDirectory: 'dist',
    functions: 'netlify/functions',
    environment: {
      NODE_VERSION: '20',
    },
    headers: {
      '/*': {
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
      '/assets/*': {
        'Cache-Control': 'public, immutable, max-age=31536000',
      },
    },
    redirects: [
      {
        from: '/*',
        to: '/index.html',
        status: 200,
      },
    ],
  },

  // AWS S3 + CloudFront configuration
  aws: {
    s3: {
      bucketName: 'radiant-ui-production',
      region: 'us-east-1',
      acl: 'private',
    },
    cloudfront: {
      distributionId: 'EXAMPLE123',
      defaultRootObject: 'index.html',
      priceClass: 'PriceClass_100',
      customErrorResponses: [
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
      ],
      defaultCacheBehavior: {
        compress: true,
        viewerProtocolPolicy: 'redirect-to-https',
        allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
        cachedMethods: ['GET', 'HEAD'],
        minTTL: 0,
        defaultTTL: 86400,
        maxTTL: 31536000,
      },
      behaviors: [
        {
          pathPattern: '/assets/*',
          compress: true,
          viewerProtocolPolicy: 'redirect-to-https',
          minTTL: 31536000,
          defaultTTL: 31536000,
          maxTTL: 31536000,
        },
      ],
    },
  },

  // Cloudflare Pages configuration
  cloudflare: {
    projectName: 'radiant-ui',
    productionBranch: 'main',
    buildCommand: 'npm run build',
    buildOutputDirectory: 'dist',
    rootDirectory: '/',
    environmentVariables: {
      NODE_VERSION: '20',
    },
    deploymentTriggers: {
      productionBranch: 'main',
      previewBranches: ['develop', 'feature/*'],
    },
  },

  // Docker deployment configuration
  docker: {
    registry: 'docker.io',
    imageName: 'radiant-ui',
    tags: ['latest', '${VERSION}', '${COMMIT_SHA}'],
    platforms: ['linux/amd64', 'linux/arm64'],
    buildArgs: {
      NODE_VERSION: '20-alpine',
    },
  },

  // Environment-specific configurations
  environments: {
    development: {
      apiUrl: 'http://localhost:3000/api',
      enableDebug: true,
      enableDevTools: true,
    },
    staging: {
      apiUrl: 'https://staging-api.radiant-ui.com',
      enableDebug: false,
      enableDevTools: true,
    },
    production: {
      apiUrl: 'https://api.radiant-ui.com',
      enableDebug: false,
      enableDevTools: false,
    },
  },

  // Build optimization settings
  optimization: {
    minify: true,
    sourcemaps: true,
    compression: true,
    bundleAnalysis: true,
    criticalCSS: true,
    imageOptimization: {
      quality: 85,
      formats: ['webp', 'avif'],
    },
    chunkSizeWarning: 500, // KB
    performanceBudget: {
      javascript: 300, // KB
      css: 100, // KB
      images: 500, // KB
      total: 1000, // KB
    },
  },

  // Monitoring and analytics
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    },
    analytics: {
      googleAnalytics: process.env.GA_TRACKING_ID,
      plausible: process.env.PLAUSIBLE_DOMAIN,
    },
  },

  // Security headers
  securityHeaders: {
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'", 'https://api.radiant-ui.com'],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
    strictTransportSecurity: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
  },
}