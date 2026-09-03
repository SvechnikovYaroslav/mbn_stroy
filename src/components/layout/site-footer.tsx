import Link from "next/link";

import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";
import { ensureSiteSettingsDynamic } from "@/lib/site-settings/dynamic";
import { getContactChannels, getSiteSettings } from "@/lib/site-settings";

function FooterNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-small text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}

export async function SiteFooter() {
  await ensureSiteSettingsDynamic();
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();
  const contactItems = getContactChannels(settings).filter(
    (item) => item.key !== "location"
  );

  return (
    <footer className="mt-auto border-t border-border bg-secondary/40">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="text-h3 text-foreground">{settings.companyName}</p>
            <p className="mt-3 max-w-sm text-body text-muted-foreground">
              {settings.slogan}
            </p>
            <p className="mt-6 text-small text-muted-foreground">
              Ремонт квартир и домов
              <br />
              {settings.location}
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-caption text-muted-foreground">Навигация</p>
            <ul className="mt-4 space-y-3">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <FooterNavLink href={item.href}>{item.title}</FooterNavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="text-caption text-muted-foreground">Контакты</p>
            {contactItems.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {contactItems.map((item) => (
                  <li key={item.key}>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-small text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...(item.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-small text-foreground">
                        {item.value}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-small text-muted-foreground">
                <Link
                  href="/contacts"
                  className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Страница контактов
                </Link>
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-small text-muted-foreground">
            © {year} {settings.companyName}
          </p>
        </div>
      </Container>
    </footer>
  );
}
