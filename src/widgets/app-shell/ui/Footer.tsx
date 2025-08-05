import { Github, Heart, Linkedin, Mail, Twitter } from 'lucide-react'

import { useTranslation } from '@/shared/lib/i18n'
import { cn } from '@/shared/lib/utils'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const { t } = useTranslation('common')

  return (
    <footer className={cn('w-full border-t bg-background', className)}>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold">Radiant UI</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('footer.description')}</p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@radiantui.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.product.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.product.features')}
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.product.pricing')}
                </a>
              </li>
              <li>
                <a
                  href="/changelog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.product.changelog')}
                </a>
              </li>
              <li>
                <a
                  href="/roadmap"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.product.roadmap')}
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.resources.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/docs"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.resources.documentation')}
                </a>
              </li>
              <li>
                <a
                  href="/guides"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.resources.guides')}
                </a>
              </li>
              <li>
                <a
                  href="/api"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.resources.apiReference')}
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.resources.blog')}
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.company.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.company.about')}
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.company.contact')}
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.company.privacyPolicy')}
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.company.termsOfService')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {t('footer.madeWith')} <Heart className="h-4 w-4 text-red-500 fill-current" />{' '}
            {t('footer.using')}
          </p>
        </div>
      </div>
    </footer>
  )
}
