import { useEffect, useState } from 'react'

import {
  Bell,
  Briefcase,
  Calendar,
  Camera,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
} from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { useAuth } from '@/features/auth'
import { useProfileData } from '@/features/profile'

import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Textarea } from '@/shared/ui/textarea'

// Form validation schema - using function to access translations
const createProfileSchema = (t: any) =>
  z.object({
    name: z.string().min(2, t('validation.nameRequired')),
    email: z.string().email(t('validation.invalidEmail')),
    phone: z.string().optional(),
    bio: z.string().max(500, t('validation.bioTooLong')).optional(),
    location: z.string().optional(),
    website: z.string().url(t('validation.invalidUrl')).optional().or(z.literal('')),
    company: z.string().optional(),
    position: z.string().optional(),
    department: z.string().optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
  })

type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>

export function ProfilePage() {
  const { t } = useTranslation('profile')
  const { user } = useAuth()
  const { data: profile, loading, updateProfile, uploading, uploadAvatar } = useProfileData()
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)

  const profileSchema = createProfileSchema(t)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    control,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      bio: '',
      location: '',
      website: '',
      company: '',
      position: '',
      department: '',
      language: 'en',
      timezone: 'UTC',
    },
  })

  // Use useWatch to avoid re-renders on every access
  const watchedDepartment = useWatch({ control, name: 'department' })
  const watchedTimezone = useWatch({ control, name: 'timezone' })
  const watchedLanguage = useWatch({ control, name: 'language' })

  // Update form values when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || user?.name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        company: profile.company || '',
        position: profile.position || '',
        department: profile.department || '',
        language: profile.language || 'en',
        timezone: profile.timezone || 'UTC',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, user?.name, user?.email])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      await updateProfile(data)
      reset(data) // Reset form with new data to clear isDirty
      toast.success(t('messages.updateSuccess'))
    } catch (error) {
      toast.error(t('messages.updateError'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('messages.invalidImageFile'))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('messages.imageTooLarge'))
      return
    }

    try {
      await uploadAvatar(file)
      toast.success(t('messages.avatarUpdateSuccess'))
    } catch (error) {
      toast.error(t('messages.avatarUpdateError'))
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profile?.avatar} alt={profile?.name} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile?.name || user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className={cn(
                      'absolute bottom-0 right-0 h-10 w-10 rounded-full',
                      'bg-primary text-primary-foreground',
                      'flex items-center justify-center cursor-pointer',
                      'hover:bg-primary/90 transition-colors',
                      uploading && 'pointer-events-none opacity-50'
                    )}
                  >
                    <Camera className="h-5 w-5" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">{profile?.name || user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
                </div>
                <Badge variant="secondary">{profile?.role || t('userCard.role')}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('accountStats.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('accountStats.memberSince')}</span>
                <span className="font-medium">
                  {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('accountStats.lastActive')}</span>
                <span className="font-medium">
                  {new Date(profile?.lastActive || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('accountStats.status')}</span>
                <Badge variant="default">{t('accountStats.active')}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
              <TabsTrigger value="professional">{t('tabs.professional')}</TabsTrigger>
              <TabsTrigger value="security">{t('tabs.security')}</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('general.title')}</CardTitle>
                    <CardDescription>{t('general.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          <User className="inline h-4 w-4 me-2" />
                          {t('general.fullName')}
                        </Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder={t('general.placeholders.fullName')}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          <Mail className="inline h-4 w-4 me-2" />
                          {t('general.email')}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          dir="ltr"
                          {...register('email')}
                          placeholder={t('general.placeholders.email')}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          <Phone className="inline h-4 w-4 me-2" />
                          {t('general.phoneNumber')}
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          dir="ltr"
                          {...register('phone')}
                          placeholder={t('general.placeholders.phoneNumber')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">
                          <MapPin className="inline h-4 w-4 me-2" />
                          {t('general.location')}
                        </Label>
                        <Input
                          id="location"
                          {...register('location')}
                          placeholder={t('general.placeholders.location')}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">{t('general.bio')}</Label>
                      <Textarea
                        id="bio"
                        {...register('bio')}
                        placeholder={t('general.bioPlaceholder')}
                        rows={4}
                      />
                      {errors.bio && (
                        <p className="text-sm text-destructive">{errors.bio.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">
                        <Globe className="inline h-4 w-4 me-2" />
                        {t('general.website')}
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        dir="ltr"
                        {...register('website')}
                        placeholder={t('general.placeholders.website')}
                      />
                      {errors.website && (
                        <p className="text-sm text-destructive">{errors.website.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="professional" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('professional.title')}</CardTitle>
                    <CardDescription>{t('professional.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">
                          <Briefcase className="inline h-4 w-4 me-2" />
                          {t('professional.company')}
                        </Label>
                        <Input
                          id="company"
                          {...register('company')}
                          placeholder={t('professional.placeholders.company')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">{t('professional.position')}</Label>
                        <Input
                          id="position"
                          {...register('position')}
                          placeholder={t('professional.placeholders.position')}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="department">{t('professional.department')}</Label>
                        <Select
                          value={watchedDepartment}
                          onValueChange={value => setValue('department', value)}
                        >
                          <SelectTrigger id="department">
                            <SelectValue
                              placeholder={t('professional.placeholders.selectDepartment')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="engineering">
                              {t('professional.departments.engineering')}
                            </SelectItem>
                            <SelectItem value="design">
                              {t('professional.departments.design')}
                            </SelectItem>
                            <SelectItem value="marketing">
                              {t('professional.departments.marketing')}
                            </SelectItem>
                            <SelectItem value="sales">
                              {t('professional.departments.sales')}
                            </SelectItem>
                            <SelectItem value="support">
                              {t('professional.departments.support')}
                            </SelectItem>
                            <SelectItem value="hr">{t('professional.departments.hr')}</SelectItem>
                            <SelectItem value="other">
                              {t('professional.departments.other')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">
                          <Calendar className="inline h-4 w-4 me-2" />
                          {t('professional.timezone')}
                        </Label>
                        <Select
                          value={watchedTimezone}
                          onValueChange={value => setValue('timezone', value)}
                        >
                          <SelectTrigger id="timezone">
                            <SelectValue
                              placeholder={t('professional.placeholders.selectTimezone')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">{t('professional.timezones.utc')}</SelectItem>
                            <SelectItem value="America/New_York">
                              {t('professional.timezones.easternTime')}
                            </SelectItem>
                            <SelectItem value="America/Chicago">
                              {t('professional.timezones.centralTime')}
                            </SelectItem>
                            <SelectItem value="America/Denver">
                              {t('professional.timezones.mountainTime')}
                            </SelectItem>
                            <SelectItem value="America/Los_Angeles">
                              {t('professional.timezones.pacificTime')}
                            </SelectItem>
                            <SelectItem value="Europe/London">
                              {t('professional.timezones.london')}
                            </SelectItem>
                            <SelectItem value="Europe/Paris">
                              {t('professional.timezones.paris')}
                            </SelectItem>
                            <SelectItem value="Asia/Tokyo">
                              {t('professional.timezones.tokyo')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="language">{t('professional.preferredLanguage')}</Label>
                      <Select
                        value={watchedLanguage}
                        onValueChange={value => setValue('language', value)}
                      >
                        <SelectTrigger id="language">
                          <SelectValue
                            placeholder={t('professional.placeholders.selectLanguage')}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">{t('professional.languages.english')}</SelectItem>
                          <SelectItem value="es">{t('professional.languages.spanish')}</SelectItem>
                          <SelectItem value="fr">{t('professional.languages.french')}</SelectItem>
                          <SelectItem value="de">{t('professional.languages.german')}</SelectItem>
                          <SelectItem value="ja">{t('professional.languages.japanese')}</SelectItem>
                          <SelectItem value="zh">{t('professional.languages.chinese')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('security.title')}</CardTitle>
                    <CardDescription>{t('security.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="2fa" className="text-base">
                              {t('security.twoFactorAuth')}
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('security.twoFactorAuthDescription')}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {t('security.enable')}
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="email-notifications" className="text-base">
                              {t('security.emailNotifications')}
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('security.emailNotificationsDescription')}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {t('security.configure')}
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">{t('security.recentActivity')}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('security.lastLogin')}</span>
                            <span>{t('security.activityValues.todayAt')}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {t('security.lastPasswordChange')}
                            </span>
                            <span>{t('security.activityValues.monthsAgo')}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {t('security.activeSessions')}
                            </span>
                            <span>{t('security.activityValues.devices')}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="pt-4">
                        <Button variant="destructive" size="sm">
                          {t('security.changePassword')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Save Button */}
              {isDirty && (
                <div className="flex items-center justify-end pt-6">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="me-2 h-4 w-4" />
                    {isSaving ? t('actions.saving') : t('actions.save')}
                  </Button>
                </div>
              )}
            </form>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
