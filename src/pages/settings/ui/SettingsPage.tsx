import { useState } from 'react'

import {
  Bell,
  Globe,
  Laptop,
  Mail,
  MessageSquare,
  Moon,
  Palette,
  Shield,
  Smartphone,
  Sun,
} from 'lucide-react'

import { LanguageSelector } from '@/features/auth'
import { useSettingsData } from '@/features/settings'

import { type SupportedLanguage, useTranslation } from '@/shared/lib/i18n'
import { toast } from '@/shared/lib/toast'
import { useTheme } from '@/shared/providers'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { Slider } from '@/shared/ui/slider'
import { Switch } from '@/shared/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

interface NotificationSetting {
  id: string
  label: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
}

export function SettingsPage() {
  const { setTheme } = useTheme()
  const { t } = useTranslation('settings')
  const { settings, loading, updateSettings, updating } = useSettingsData()
  const [activeTab, setActiveTab] = useState('appearance')
  const [hasChanges, setHasChanges] = useState(false)

  // Local state for settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: settings?.theme || 'system',
    fontSize: settings?.fontSize || 100,
    reducedMotion: settings?.reducedMotion || false,
    highContrast: settings?.highContrast || false,
  })

  const [languageSettings, setLanguageSettings] = useState({
    language: settings?.language || 'en',
    region: settings?.region || 'US',
    dateFormat: settings?.dateFormat || 'MM/DD/YYYY',
    timeFormat: settings?.timeFormat || '12h',
    firstDayOfWeek: settings?.firstDayOfWeek || 'sunday',
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'updates',
      label: t('notifications.types.updates.label'),
      description: t('notifications.types.updates.description'),
      email: settings?.notifications?.updates?.email ?? true,
      push: settings?.notifications?.updates?.push ?? true,
      sms: settings?.notifications?.updates?.sms ?? false,
    },
    {
      id: 'security',
      label: t('notifications.types.security.label'),
      description: t('notifications.types.security.description'),
      email: settings?.notifications?.security?.email ?? true,
      push: settings?.notifications?.security?.push ?? true,
      sms: settings?.notifications?.security?.sms ?? true,
    },
    {
      id: 'marketing',
      label: t('notifications.types.marketing.label'),
      description: t('notifications.types.marketing.description'),
      email: settings?.notifications?.marketing?.email ?? false,
      push: settings?.notifications?.marketing?.push ?? false,
      sms: settings?.notifications?.marketing?.sms ?? false,
    },
    {
      id: 'reminders',
      label: t('notifications.types.reminders.label'),
      description: t('notifications.types.reminders.description'),
      email: settings?.notifications?.reminders?.email ?? true,
      push: settings?.notifications?.reminders?.push ?? true,
      sms: settings?.notifications?.reminders?.sms ?? false,
    },
  ])

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: (settings?.privacy?.profileVisibility || 'public') as
      | 'public'
      | 'friends'
      | 'private',
    showEmail: settings?.privacy?.showEmail || false,
    showPhone: settings?.privacy?.showPhone || false,
    allowIndexing: settings?.privacy?.allowIndexing ?? true,
    dataCollection: settings?.privacy?.dataCollection ?? true,
  })

  const handleSaveSettings = () => {
    const allSettings = {
      theme: appearanceSettings.theme,
      fontSize: appearanceSettings.fontSize,
      reducedMotion: appearanceSettings.reducedMotion,
      highContrast: appearanceSettings.highContrast,
      language: languageSettings.language,
      region: languageSettings.region,
      dateFormat: languageSettings.dateFormat,
      timeFormat: languageSettings.timeFormat,
      firstDayOfWeek: languageSettings.firstDayOfWeek,
      notifications: notificationSettings.reduce(
        (acc, setting) => ({
          ...acc,
          [setting.id]: {
            email: setting.email,
            push: setting.push,
            sms: setting.sms,
          },
        }),
        {}
      ),
      privacy: privacySettings,
    }

    updateSettings(allSettings)
    setHasChanges(false)
    toast.success(t('messages.settingsSaved'))
  }

  const handleThemeChange = (value: string) => {
    const themeValue = value as 'light' | 'dark' | 'system'
    setAppearanceSettings(prev => ({ ...prev, theme: themeValue }))
    setTheme(themeValue)
    setHasChanges(true)
  }

  const handleLanguageChange = (value: SupportedLanguage) => {
    setLanguageSettings(prev => ({ ...prev, language: value }))
    setHasChanges(true)
  }

  const handleNotificationChange = (
    settingId: string,
    channel: 'email' | 'push' | 'sms',
    value: boolean
  ) => {
    setNotificationSettings(prev =>
      prev.map(setting => (setting.id === settingId ? { ...setting, [channel]: value } : setting))
    )
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSaveSettings} disabled={updating}>
            {updating ? t('actions.saving') : t('actions.saveChanges')}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1 sm:flex sm:h-9 sm:w-fit lg:w-[600px]">
          <TabsTrigger value="appearance" className="h-9 data-[state=active]:text-foreground">
            <Palette className="me-1.5 h-4 w-4 sm:me-2" />
            <span className="text-xs sm:text-sm">{t('tabs.appearance')}</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="h-9 data-[state=active]:text-foreground">
            <Globe className="me-1.5 h-4 w-4 sm:me-2" />
            <span className="text-xs sm:text-sm">{t('tabs.language')}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="h-9 data-[state=active]:text-foreground">
            <Bell className="me-1.5 h-4 w-4 sm:me-2" />
            <span className="text-xs sm:text-sm">{t('tabs.notifications')}</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="h-9 data-[state=active]:text-foreground">
            <Shield className="me-1.5 h-4 w-4 sm:me-2" />
            <span className="text-xs sm:text-sm">{t('tabs.privacy')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('appearance.title')}</CardTitle>
              <CardDescription>{t('appearance.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>{t('appearance.colorTheme')}</Label>
                <RadioGroup value={appearanceSettings.theme} onValueChange={handleThemeChange}>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                      <Sun className="h-4 w-4" />
                      {t('appearance.themes.light')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                      <Moon className="h-4 w-4" />
                      {t('appearance.themes.dark')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                      <Laptop className="h-4 w-4" />
                      {t('appearance.themes.system')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="font-size">{t('appearance.fontSize')}</Label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-12">
                      {appearanceSettings.fontSize}%
                    </span>
                    <Slider
                      id="font-size"
                      min={80}
                      max={120}
                      step={10}
                      value={[appearanceSettings.fontSize]}
                      onValueChange={([value]) => {
                        setAppearanceSettings(prev => ({ ...prev, fontSize: value }))
                        setHasChanges(true)
                      }}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('appearance.fontSizeDescription')}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduced-motion">{t('appearance.reducedMotion')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('appearance.reducedMotionDescription')}
                    </p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={appearanceSettings.reducedMotion}
                    onCheckedChange={checked => {
                      setAppearanceSettings(prev => ({ ...prev, reducedMotion: checked }))
                      setHasChanges(true)
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">{t('appearance.highContrast')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('appearance.highContrastDescription')}
                    </p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={appearanceSettings.highContrast}
                    onCheckedChange={checked => {
                      setAppearanceSettings(prev => ({ ...prev, highContrast: checked }))
                      setHasChanges(true)
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('language.title')}</CardTitle>
              <CardDescription>{t('language.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">{t('language.language')}</Label>
                  <LanguageSelector
                    className="w-full"
                    showIcon={false}
                    onChange={handleLanguageChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">{t('language.region')}</Label>
                  <Select
                    value={languageSettings.region}
                    onValueChange={value => {
                      setLanguageSettings(prev => ({ ...prev, region: value }))
                      setHasChanges(true)
                    }}
                  >
                    <SelectTrigger id="region">
                      <SelectValue placeholder={t('language.placeholders.selectRegion')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">{t('language.regions.US')}</SelectItem>
                      <SelectItem value="GB">{t('language.regions.GB')}</SelectItem>
                      <SelectItem value="CA">{t('language.regions.CA')}</SelectItem>
                      <SelectItem value="AU">{t('language.regions.AU')}</SelectItem>
                      <SelectItem value="DE">{t('language.regions.DE')}</SelectItem>
                      <SelectItem value="FR">{t('language.regions.FR')}</SelectItem>
                      <SelectItem value="JP">{t('language.regions.JP')}</SelectItem>
                      <SelectItem value="CN">{t('language.regions.CN')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date-format">{t('language.dateFormat')}</Label>
                  <Select
                    value={languageSettings.dateFormat}
                    onValueChange={value => {
                      setLanguageSettings(prev => ({ ...prev, dateFormat: value }))
                      setHasChanges(true)
                    }}
                  >
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder={t('language.placeholders.selectDateFormat')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-format">{t('language.timeFormat')}</Label>
                  <Select
                    value={languageSettings.timeFormat}
                    onValueChange={value => {
                      setLanguageSettings(prev => ({ ...prev, timeFormat: value as '12h' | '24h' }))
                      setHasChanges(true)
                    }}
                  >
                    <SelectTrigger id="time-format">
                      <SelectValue placeholder={t('language.placeholders.selectTimeFormat')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">{t('language.timeFormats.12h')}</SelectItem>
                      <SelectItem value="24h">{t('language.timeFormats.24h')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first-day">{t('language.firstDayOfWeek')}</Label>
                <Select
                  value={languageSettings.firstDayOfWeek}
                  onValueChange={value => {
                    setLanguageSettings(prev => ({
                      ...prev,
                      firstDayOfWeek: value as 'sunday' | 'monday' | 'saturday',
                    }))
                    setHasChanges(true)
                  }}
                >
                  <SelectTrigger id="first-day">
                    <SelectValue placeholder={t('language.placeholders.selectFirstDay')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">{t('language.weekDays.sunday')}</SelectItem>
                    <SelectItem value="monday">{t('language.weekDays.monday')}</SelectItem>
                    <SelectItem value="saturday">{t('language.weekDays.saturday')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications.title')}</CardTitle>
              <CardDescription>{t('notifications.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Notification channels header */}
                <div className="flex items-center justify-end gap-6 pb-4 border-b">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {t('notifications.channels.email')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Smartphone className="h-4 w-4" />
                    {t('notifications.channels.push')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    {t('notifications.channels.sms')}
                  </div>
                </div>

                {/* Notification settings */}
                {notificationSettings.map(setting => (
                  <div key={setting.id} className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="text-base">{setting.label}</Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <Switch
                          checked={setting.email}
                          onCheckedChange={checked =>
                            handleNotificationChange(setting.id, 'email', checked)
                          }
                        />
                        <Switch
                          checked={setting.push}
                          onCheckedChange={checked =>
                            handleNotificationChange(setting.id, 'push', checked)
                          }
                        />
                        <Switch
                          checked={setting.sms}
                          onCheckedChange={checked =>
                            handleNotificationChange(setting.id, 'sms', checked)
                          }
                        />
                      </div>
                    </div>
                    {setting.id !== 'reminders' && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('notifications.schedule.title')}</CardTitle>
              <CardDescription>{t('notifications.schedule.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="quiet-hours">{t('notifications.schedule.quietHours')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.schedule.quietHoursDescription')}
                  </p>
                </div>
                <Switch id="quiet-hours" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">{t('notifications.schedule.startTime')}</Label>
                  <Input type="time" id="quiet-start" defaultValue="22:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">{t('notifications.schedule.endTime')}</Label>
                  <Input type="time" id="quiet-end" defaultValue="08:00" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('privacy.title')}</CardTitle>
              <CardDescription>{t('privacy.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>{t('privacy.profileVisibility')}</Label>
                <RadioGroup
                  value={privacySettings.profileVisibility}
                  onValueChange={value => {
                    setPrivacySettings(prev => ({
                      ...prev,
                      profileVisibility: value as 'public' | 'friends' | 'private',
                    }))
                    setHasChanges(true)
                  }}
                >
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="cursor-pointer">
                      {t('privacy.profileOptions.public')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="friends" id="friends" />
                    <Label htmlFor="friends" className="cursor-pointer">
                      {t('privacy.profileOptions.friends')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="cursor-pointer">
                      {t('privacy.profileOptions.private')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-email">{t('privacy.showEmail')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('privacy.showEmailDescription')}
                    </p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={privacySettings.showEmail}
                    onCheckedChange={checked => {
                      setPrivacySettings(prev => ({ ...prev, showEmail: checked }))
                      setHasChanges(true)
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-phone">{t('privacy.showPhone')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('privacy.showPhoneDescription')}
                    </p>
                  </div>
                  <Switch
                    id="show-phone"
                    checked={privacySettings.showPhone}
                    onCheckedChange={checked => {
                      setPrivacySettings(prev => ({ ...prev, showPhone: checked }))
                      setHasChanges(true)
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="search-indexing">{t('privacy.searchIndexing')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('privacy.searchIndexingDescription')}
                    </p>
                  </div>
                  <Switch
                    id="search-indexing"
                    checked={privacySettings.allowIndexing}
                    onCheckedChange={checked => {
                      setPrivacySettings(prev => ({ ...prev, allowIndexing: checked }))
                      setHasChanges(true)
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-collection">{t('privacy.dataCollection')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('privacy.dataCollectionDescription')}
                    </p>
                  </div>
                  <Switch
                    id="data-collection"
                    checked={privacySettings.dataCollection}
                    onCheckedChange={checked => {
                      setPrivacySettings(prev => ({ ...prev, dataCollection: checked }))
                      setHasChanges(true)
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('privacy.dataManagement.title')}</CardTitle>
              <CardDescription>{t('privacy.dataManagement.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('privacy.dataManagement.exportData')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('privacy.dataManagement.exportDataDescription')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('privacy.dataManagement.requestExport')}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">
                    {t('privacy.dataManagement.deleteAccount')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('privacy.dataManagement.deleteAccountDescription')}
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  {t('privacy.dataManagement.deleteAccount')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
