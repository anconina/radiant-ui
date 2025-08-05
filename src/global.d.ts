// Global type declarations

declare global {
  // Extend Window interface
  interface Window {
    __RADIANT_UI__: {
      version: string
      environment: 'development' | 'staging' | 'production'
      debug: boolean
    }
  }

  // Custom events
  interface WindowEventMap {
    'theme-change': CustomEvent<{ theme: 'light' | 'dark' | 'system' }>
    'auth-expire': CustomEvent<{ reason: string }>
    'network-status': CustomEvent<{ online: boolean }>
  }
}

// Module declarations
declare module '*.svg' {
  import React = require('react')
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.avif' {
  const content: string
  export default content
}

declare module '*.woff' {
  const content: string
  export default content
}

declare module '*.woff2' {
  const content: string
  export default content
}

declare module '*.json' {
  const content: Record<string, any>
  export default content
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// Ensure this file is treated as a module
export {}
