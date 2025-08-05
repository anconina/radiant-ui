import { useState } from 'react'

import { Search, UserPlus } from 'lucide-react'
import { Edit, Mail, MoreHorizontal, Shield, Trash2 } from 'lucide-react'

import { useTranslation } from 'react-i18next'

import { Avatar } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Input } from '@/shared/ui/input'
import {
  ResponsiveTable,
  ResponsiveTableBody,
  ResponsiveTableCell,
  ResponsiveTableHead,
  ResponsiveTableHeader,
  ResponsiveTableRow,
} from '@/shared/ui/responsive-table'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  status: 'active' | 'inactive' | 'pending'
  joinedDate: string
  avatar?: string
}

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    status: 'active',
    joinedDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'user',
    status: 'active',
    joinedDate: '2024-02-20',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'moderator',
    status: 'inactive',
    joinedDate: '2024-03-10',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'user',
    status: 'pending',
    joinedDate: '2024-03-15',
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'user',
    status: 'active',
    joinedDate: '2024-03-20',
  },
]

export function UserManagementPage() {
  const { t } = useTranslation('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [users] = useState<User[]>(mockUsers)

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'moderator':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getStatusBadgeVariant = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'pending':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('page.title')}</h1>
          <p className="text-muted-foreground">{t('page.subtitle')}</p>
        </div>
        <Button>
          <UserPlus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          {t('page.addUser')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ltr:order-1 rtl:order-2 ltr:mr-auto rtl:ml-auto ltr:text-left rtl:text-right">
              {t('stats.totalUsers')}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground ltr:order-2 rtl:order-1 ltr:ml-auto rtl:mr-auto"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">{users.length}</div>
            <p className="text-xs text-muted-foreground ltr:text-left rtl:text-right">
              {t('stats.totalUsersDescription', { count: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ltr:order-1 rtl:order-2 ltr:mr-auto rtl:ml-auto ltr:text-left rtl:text-right">
              {t('stats.activeUsers')}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground ltr:order-2 rtl:order-1 ltr:ml-auto rtl:mr-auto"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground ltr:text-left rtl:text-right">
              {t('stats.activeUsersDescription', {
                percentage: Math.round(
                  (users.filter(u => u.status === 'active').length / users.length) * 100
                ),
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ltr:order-1 rtl:order-2 ltr:mr-auto rtl:ml-auto ltr:text-left rtl:text-right">
              {t('stats.adminUsers')}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground ltr:order-2 rtl:order-1 ltr:ml-auto rtl:mr-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground ltr:text-left rtl:text-right">
              {t('stats.adminUsersDescription')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{t('table.title')}</CardTitle>
              <CardDescription>{t('table.description')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute ltr:left-2.5 rtl:right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('table.searchPlaceholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="ltr:pl-8 rtl:pr-8 w-[200px] sm:w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <ResponsiveTable mobileLayout="cards">
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead>{t('table.headers.user')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('table.headers.role')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('table.headers.status')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('table.headers.joined')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-end">
                    {t('table.headers.actions')}
                  </ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                {filteredUsers.length === 0 ? (
                  <ResponsiveTableRow>
                    <ResponsiveTableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">{t('table.noResults')}</p>
                    </ResponsiveTableCell>
                  </ResponsiveTableRow>
                ) : (
                  filteredUsers.map(user => (
                    <ResponsiveTableRow key={user.id}>
                      <ResponsiveTableCell mobileLabel={t('table.headers.user')}>
                        <div className="flex items-center gap-3 min-w-0 ltr:flex-row rtl:flex-row-reverse">
                          <Avatar className="h-8 w-8 shrink-0 ltr:order-1 rtl:order-2">
                            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                              <span className="text-xs font-medium">{getInitials(user.name)}</span>
                            </div>
                          </Avatar>
                          <div className="min-w-0 flex-1 ltr:order-2 rtl:order-1 ltr:text-left rtl:text-right">
                            <div className="font-medium truncate">{user.name}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell mobileLabel={t('table.headers.role')}>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {t(`roles.${user.role}`)}
                        </Badge>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell mobileLabel={t('table.headers.status')}>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {t(`statuses.${user.status}`)}
                        </Badge>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell mobileLabel={t('table.headers.joined')}>
                        {new Date(user.joinedDate).toLocaleDateString()}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell mobileLabel={t('table.headers.actions')}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">{t('actions.openMenu')}</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('table.headers.actions')}</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                              {t('actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                              {t('actions.sendEmail')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                              {t('actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  ))
                )}
              </ResponsiveTableBody>
            </ResponsiveTable>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
