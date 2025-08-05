import { useState } from 'react'

import {
  Book,
  ChevronRight,
  Code,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Settings,
  Shield,
  Smartphone,
  Users,
  Zap,
} from 'lucide-react'

import { useDirectionalStyles, useTranslation } from '@/shared/lib/i18n'
import { cn } from '@/shared/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

interface FAQItem {
  question: string
  answer: string
  category: string
}

interface GuideItem {
  title: string
  description: string
  icon: React.ElementType
  href: string
  category: string
}

// FAQ items with translation keys
interface FAQItemWithKeys {
  questionKey: string
  answerKey: string
  category: string
}

const faqItems: FAQItemWithKeys[] = [
  {
    questionKey: 'faq.questions.resetPassword.question',
    answerKey: 'faq.questions.resetPassword.answer',
    category: 'account',
  },
  {
    questionKey: 'faq.questions.upgradeSubscription.question',
    answerKey: 'faq.questions.upgradeSubscription.answer',
    category: 'billing',
  },
  {
    questionKey: 'faq.questions.dataSecure.question',
    answerKey: 'faq.questions.dataSecure.answer',
    category: 'security',
  },
  {
    questionKey: 'faq.questions.exportData.question',
    answerKey: 'faq.questions.exportData.answer',
    category: 'account',
  },
  {
    questionKey: 'faq.questions.cancelSubscription.question',
    answerKey: 'faq.questions.cancelSubscription.answer',
    category: 'billing',
  },
  {
    questionKey: 'faq.questions.paymentMethods.question',
    answerKey: 'faq.questions.paymentMethods.answer',
    category: 'billing',
  },
  {
    questionKey: 'faq.questions.twoFactor.question',
    answerKey: 'faq.questions.twoFactor.answer',
    category: 'security',
  },
  {
    questionKey: 'faq.questions.api.question',
    answerKey: 'faq.questions.api.answer',
    category: 'technical',
  },
]

// Guide items with translation keys
interface GuideItemWithKeys {
  titleKey: string
  descriptionKey: string
  icon: React.ElementType
  href: string
  category: string
}

const guides: GuideItemWithKeys[] = [
  {
    titleKey: 'guides.items.gettingStarted.title',
    descriptionKey: 'guides.items.gettingStarted.description',
    icon: Zap,
    href: '#',
    category: 'basics',
  },
  {
    titleKey: 'guides.items.accountManagement.title',
    descriptionKey: 'guides.items.accountManagement.description',
    icon: Users,
    href: '#',
    category: 'account',
  },
  {
    titleKey: 'guides.items.billing.title',
    descriptionKey: 'guides.items.billing.description',
    icon: CreditCard,
    href: '#',
    category: 'billing',
  },
  {
    titleKey: 'guides.items.security.title',
    descriptionKey: 'guides.items.security.description',
    icon: Shield,
    href: '#',
    category: 'security',
  },
  {
    titleKey: 'guides.items.api.title',
    descriptionKey: 'guides.items.api.description',
    icon: Code,
    href: '#',
    category: 'developers',
  },
  {
    titleKey: 'guides.items.mobile.title',
    descriptionKey: 'guides.items.mobile.description',
    icon: Smartphone,
    href: '#',
    category: 'mobile',
  },
  {
    titleKey: 'guides.items.collaboration.title',
    descriptionKey: 'guides.items.collaboration.description',
    icon: Users,
    href: '#',
    category: 'features',
  },
  {
    titleKey: 'guides.items.advanced.title',
    descriptionKey: 'guides.items.advanced.description',
    icon: Settings,
    href: '#',
    category: 'features',
  },
]

export function HelpPage() {
  const { t } = useTranslation('help')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { direction, isRTL } = useDirectionalStyles()
  const getDirectionalStyle = () => ({ textAlign: isRTL ? 'right' : 'left', direction })

  const filteredFAQs = faqItems.filter(item => {
    const question = t(item.questionKey)
    const answer = t(item.answerKey)
    const matchesSearch =
      question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredGuides = guides.filter(guide => {
    const title = t(guide.titleKey)
    const description = t(guide.descriptionKey)
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-4" dir={direction}>
        <h1 className="text-4xl font-bold tracking-tight" style={getDirectionalStyle()}>
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground" style={getDirectionalStyle()}>
          {t('subtitle')}
        </p>
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute end-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pe-10 h-12 text-lg"
            style={getDirectionalStyle()}
            dir={direction}
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Book className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-base">{t('quickLinks.documentation')}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-base">{t('quickLinks.community')}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Mail className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-base">{t('quickLinks.emailSupport')}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Phone className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-base">{t('quickLinks.callUs')}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="faq" className="space-y-4" dir={direction}>
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto" dir={direction}>
          <TabsTrigger value="faq" className="text-center" dir={direction}>
            {t('tabs.faq')}
          </TabsTrigger>
          <TabsTrigger value="guides" className="text-center" dir={direction}>
            {t('tabs.guides')}
          </TabsTrigger>
          <TabsTrigger value="contact" className="text-center" dir={direction}>
            {t('tabs.contact')}
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={getDirectionalStyle()}>{t('faq.title')}</CardTitle>
              <CardDescription style={getDirectionalStyle()}>{t('faq.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('all')}
                >
                  {t('faq.categories.allTopics')}
                </Badge>
                <Badge
                  variant={selectedCategory === 'account' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('account')}
                >
                  {t('faq.categories.account')}
                </Badge>
                <Badge
                  variant={selectedCategory === 'billing' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('billing')}
                >
                  {t('faq.categories.billing')}
                </Badge>
                <Badge
                  variant={selectedCategory === 'security' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('security')}
                >
                  {t('faq.categories.security')}
                </Badge>
                <Badge
                  variant={selectedCategory === 'technical' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('technical')}
                >
                  {t('faq.categories.technical')}
                </Badge>
              </div>
              <div className="space-y-4">
                {filteredFAQs.map((item, index) => (
                  <div key={index} className="border rounded-lg">
                    <div className="p-4">
                      <h3 className="font-medium" style={getDirectionalStyle()}>
                        {t(item.questionKey)}
                      </h3>
                      <p
                        className="mt-2 text-sm text-muted-foreground"
                        style={getDirectionalStyle()}
                      >
                        {t(item.answerKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" style={getDirectionalStyle()}>
                    {t('faq.noResults')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={getDirectionalStyle()}>{t('guides.title')}</CardTitle>
              <CardDescription style={getDirectionalStyle()}>
                {t('guides.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredGuides.map((guide, index) => {
                  const Icon = guide.icon
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <CardTitle className="text-base" style={getDirectionalStyle()}>
                                {t(guide.titleKey)}
                              </CardTitle>
                              <CardDescription className="text-sm" style={getDirectionalStyle()}>
                                {t(guide.descriptionKey)}
                              </CardDescription>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
              {filteredGuides.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" style={getDirectionalStyle()}>
                    {t('guides.noResults')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle style={getDirectionalStyle()}>{t('contact.support.title')}</CardTitle>
                <CardDescription style={getDirectionalStyle()}>
                  {t('contact.support.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertTitle style={getDirectionalStyle()}>
                    {t('contact.support.hours.title')}
                  </AlertTitle>
                  <AlertDescription style={getDirectionalStyle()}>
                    {t('contact.support.hours.description')}
                  </AlertDescription>
                </Alert>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Mail className="me-2 h-4 w-4" />
                    {t('contact.support.email')}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="me-2 h-4 w-4" />
                    {t('contact.support.phone')}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageCircle className="me-2 h-4 w-4" />
                    {t('contact.support.liveChat')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={getDirectionalStyle()}>{t('contact.resources.title')}</CardTitle>
                <CardDescription style={getDirectionalStyle()}>
                  {t('contact.resources.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-between" variant="ghost">
                  <span className="flex items-center">
                    <Globe className="me-2 h-4 w-4" />
                    {t('contact.resources.communityForum')}
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="ghost">
                  <span className="flex items-center">
                    <FileText className="me-2 h-4 w-4" />
                    {t('contact.resources.apiDocs')}
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="ghost">
                  <span className="flex items-center">
                    <Code className="me-2 h-4 w-4" />
                    {t('contact.resources.developerPortal')}
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="ghost">
                  <span className="flex items-center">
                    <Book className="me-2 h-4 w-4" />
                    {t('contact.resources.videoTutorials')}
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle style={getDirectionalStyle()}>{t('contact.ticket.title')}</CardTitle>
              <CardDescription style={getDirectionalStyle()}>
                {t('contact.ticket.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg">
                <Mail className="me-2 h-4 w-4" />
                {t('contact.ticket.button')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
