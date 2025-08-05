import { useEffect, useState } from 'react'

import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Clock,
  Filter,
  Info,
  X,
  XCircle,
} from 'lucide-react'

import { useTranslation } from '@/shared/lib/i18n'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  from?: {
    name: string
    avatar?: string
  }
  action?: {
    label: string
    href: string
  }
}

// Mock data will be created with translations
const createMockNotifications = (t: any): Notification[] => [
  {
    id: '1',
    type: 'success',
    title: t('mock.paymentReceived.title'),
    message: t('mock.paymentReceived.message'),
    timestamp: '2024-03-25T10:30:00',
    read: false,
    from: {
      name: 'John Doe',
    },
    action: {
      label: t('mock.paymentReceived.action'),
      href: '#',
    },
  },
  {
    id: '2',
    type: 'info',
    title: t('mock.newFeature.title'),
    message: t('mock.newFeature.message'),
    timestamp: '2024-03-25T09:15:00',
    read: false,
    action: {
      label: t('mock.newFeature.action'),
      href: '#',
    },
  },
  {
    id: '3',
    type: 'warning',
    title: t('mock.securityAlert.title'),
    message: t('mock.securityAlert.message'),
    timestamp: '2024-03-24T18:45:00',
    read: true,
    action: {
      label: t('mock.securityAlert.action'),
      href: '#',
    },
  },
  {
    id: '4',
    type: 'error',
    title: t('mock.paymentFailed.title'),
    message: t('mock.paymentFailed.message'),
    timestamp: '2024-03-24T14:30:00',
    read: true,
    action: {
      label: t('mock.paymentFailed.action'),
      href: '#',
    },
  },
  {
    id: '5',
    type: 'info',
    title: t('mock.systemMaintenance.title'),
    message: t('mock.systemMaintenance.message'),
    timestamp: '2024-03-24T10:00:00',
    read: true,
  },
  {
    id: '6',
    type: 'success',
    title: t('mock.profileUpdated.title'),
    message: t('mock.profileUpdated.message'),
    timestamp: '2024-03-23T16:20:00',
    read: true,
  },
  {
    id: '7',
    type: 'info',
    title: t('mock.newTeamMember.title'),
    message: t('mock.newTeamMember.message'),
    timestamp: '2024-03-23T14:00:00',
    read: true,
    from: {
      name: 'Sarah Johnson',
    },
  },
  {
    id: '8',
    type: 'warning',
    title: t('mock.storageLimit.title'),
    message: t('mock.storageLimit.message'),
    timestamp: '2024-03-23T11:30:00',
    read: true,
    action: {
      label: t('mock.storageLimit.action'),
      href: '#',
    },
  },
]

export function NotificationsPage() {
  const { t, i18n } = useTranslation('notifications')
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    createMockNotifications(t)
  )
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Update notifications when language changes
  useEffect(() => {
    setNotifications(createMockNotifications(t))
  }, [i18n.language, t])

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    return true
  })

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getNotificationBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 7) {
      return date.toLocaleDateString(i18n.language === 'he' ? 'he-IL' : 'en-US')
    } else if (days > 0) {
      return t('time.ago', { time: t('time.days', { count: days }) })
    } else if (hours > 0) {
      return t('time.ago', { time: t('time.hours', { count: hours }) })
    } else {
      const minutes = Math.floor(diff / (1000 * 60))
      return t('time.ago', { time: t('time.minutes', { count: minutes }) })
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
          <p className="text-muted-foreground">{t('page.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="me-2 h-4 w-4" />
                {t('filter.button')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('filter.label')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter('all')}>
                {t('filter.all')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('unread')}>
                {t('filter.unread')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="me-2 h-4 w-4" />
              {t('actions.markAllAsRead')}
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              {t('actions.clearAll')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ltr:order-1 rtl:order-2 ltr:mr-auto rtl:ml-auto ltr:text-left rtl:text-right">
              {t('stats.total.title')}
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground ltr:order-2 rtl:order-1 ltr:ml-auto rtl:mr-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">{notifications.length}</div>
            <p className="text-xs text-muted-foreground ltr:text-left rtl:text-right">
              {t('stats.total.description')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ltr:order-1 rtl:order-2 ltr:mr-auto rtl:ml-auto ltr:text-left rtl:text-right">
              {t('stats.unread.title')}
            </CardTitle>
            <Badge
              variant="destructive"
              className="ltr:order-2 rtl:order-1 ltr:ml-auto rtl:mr-auto"
            >
              {unreadCount}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">{unreadCount}</div>
            <p className="text-xs text-muted-foreground ltr:text-left rtl:text-right">
              {t('stats.unread.description')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ltr:order-1 rtl:order-2 ltr:mr-auto rtl:ml-auto ltr:text-left rtl:text-right">
              {t('stats.thisWeek.title')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground ltr:order-2 rtl:order-1 ltr:ml-auto rtl:mr-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              {
                notifications.filter(n => {
                  const date = new Date(n.timestamp)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return date > weekAgo
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground ltr:text-left rtl:text-right">
              {t('stats.thisWeek.description')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ltr:order-1 rtl:order-2 ltr:mr-auto rtl:ml-auto ltr:text-left rtl:text-right">
              {t('stats.actions.title')}
            </CardTitle>
            <CheckCheck className="h-4 w-4 text-muted-foreground ltr:order-2 rtl:order-1 ltr:ml-auto rtl:mr-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              {notifications.filter(n => n.action).length}
            </div>
            <p className="text-xs text-muted-foreground ltr:text-left rtl:text-right">
              {t('stats.actions.description')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('card.title')}</CardTitle>
          <CardDescription>{t('card.description')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {filter === 'unread' ? t('empty.unread') : t('empty.all')}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-muted/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {notification.from ? (
                          <Avatar className="h-10 w-10">
                            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                              <span className="text-sm font-medium">
                                {getInitials(notification.from.name)}
                              </span>
                            </div>
                          </Avatar>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold">{notification.title}</h4>
                            <Badge
                              variant={getNotificationBadgeVariant(notification.type)}
                              className="text-xs"
                            >
                              {t(`types.${notification.type}`)}
                            </Badge>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">
                                {t('badges.new')}
                              </Badge>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <X className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <>
                                  <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                    <Check className="me-2 h-4 w-4" />
                                    {t('actions.markAsRead')}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="me-2 h-4 w-4" />
                                {t('actions.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.from && (
                              <span className="text-xs text-muted-foreground">
                                {t('time.from', { name: notification.from.name })}
                              </span>
                            )}
                          </div>
                          {notification.action && (
                            <Button variant="link" size="sm" className="h-auto p-0">
                              {notification.action.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
