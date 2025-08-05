import { Search } from 'lucide-react'

import { useTranslation } from '@/shared/lib/i18n'
import { Label } from '@/shared/ui/label'

import { SidebarInput } from '../Sidebar'

export function SearchForm({ ...props }: React.ComponentProps<'form'>) {
  const { t } = useTranslation('common')

  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          {t('actions.search')}
        </Label>
        <SidebarInput
          id="search"
          placeholder={t('sidebar.searchPlaceholder')}
          className="h-8 ps-8 pe-2"
        />
        <Search className="pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
      </div>
    </form>
  )
}
