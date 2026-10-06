import Link from "next/link";

import { Container } from "@/components/layout/container";
import { CookieSettingsLink } from "@/components/legal/cookie-settings-link";
import { siteConfig } from "@/config/site";

function FooterNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-small text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {children}
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="text-h3 text-foreground">{siteConfig.name}</p>
            <p className="mt-4 text-small text-muted-foreground">
              Ремонт квартир и домов
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-caption text-muted-foreground">Навигация</p>
            <ul className="mt-4 space-y-3">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}><FooterNavLink href={item.href}>{item.title}</FooterNavLink></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="text-caption text-muted-foreground">Контакты</p>
            <div className="mt-4 space-y-6">
              <div className="space-y-2">
                <a href="tel:+79207414124" className="block text-body-lg font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">+7 920 741-41-24</a>
                <a href="mailto:otdelka-360@yandex.ru" className="block text-small text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">otdelka-360@yandex.ru</a>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Офис</p>
                <p className="mt-2 text-small text-foreground">г. Тула, ул. Кирова, 135/1</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Соцсети</p>
                <a href="https://vk.ru/otdelka360tula" className="mt-2 inline-flex text-small text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">ВКонтакте <span className="ml-1" aria-hidden="true">→</span></a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li><FooterNavLink href="/legal/privacy">Политика обработки персональных данных</FooterNavLink></li>
            <li><FooterNavLink href="/legal/consent">Согласие на обработку персональных данных</FooterNavLink></li>
            <li><FooterNavLink href="/legal/cookies">Политика cookies</FooterNavLink></li>
            <li><FooterNavLink href="/legal/terms">Пользовательское соглашение</FooterNavLink></li>
            <li><CookieSettingsLink /></li>
          </ul>
          <p className="mt-6 text-small text-muted-foreground">© {year} {siteConfig.name}</p>
        </div>
      </Container>
    </footer>
  );
}
