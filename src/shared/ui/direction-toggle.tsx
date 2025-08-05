import { Languages } from 'lucide-react'

import { useLanguage } from '@/shared/lib/i18n'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export function DirectionToggle() {
  const { language, changeLanguage, languages, direction } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {direction === 'rtl' ? 'RTL' : 'LTR'} ({language.toUpperCase()})
          </span>
          <span className="sm:hidden">{direction.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, info]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code as keyof typeof languages)}
            className="gap-2"
          >
            <span className="text-xs opacity-60">{info.dir.toUpperCase()}</span>
            <span>{info.nativeName}</span>
            {code === language && <span className="text-xs opacity-60">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
