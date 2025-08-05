import { Monitor, Moon, Sun } from 'lucide-react'

import { useTheme } from '@/shared/providers'
import { Button } from '@/shared/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('light')}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('system')}
        aria-label="System theme"
      >
        <Monitor className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('dark')}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  )
}
