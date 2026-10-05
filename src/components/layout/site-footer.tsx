import Link from "next/link";

import { Container } from "@/components/layout/container";
import { CookieSettingsLink } from "@/components/legal/cookie-settings-link";
import { siteConfig } from "@/config/site";
import { ensureSiteSettingsDynamic } from "@/lib/site-settings/dynamic";
import { getSiteSettings } from "@/lib/site-settings";

function FooterNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-small text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {children}
    </Link>
  );
}

export async function SiteFooter() {
  await ensureSiteSettingsDynamic();
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="text-h3 text-foreground">{siteConfig.name}</p>
            <p className="mt-4 text-small text-muted-foreground">
              Ремонт квартир и домов
              <br />
              Тула и Тульская область
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
            <ul className="mt-4 space-y-3">
              <li><a href="tel:+79207414124" className="text-small text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">+7 920 741-41-24</a></li>
              <li className="text-small text-foreground">Тула и Тульская область</li>
              {settings.email ? (
                <li><a href={`mailto:${settings.email}`} className="text-small text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{settings.email}</a></li>
              ) : null}
            </ul>
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
