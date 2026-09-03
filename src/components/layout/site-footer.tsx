import Link from "next/link";

import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

function FooterNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  const className =
    "text-small text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (isInternal) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-secondary/40">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="text-h3 text-foreground">{siteConfig.name}</p>
            <p className="mt-3 max-w-sm text-body text-muted-foreground">
              {siteConfig.slogan}
            </p>
            <p className="mt-6 text-small text-muted-foreground">
              Ремонт квартир и домов
              <br />
              {siteConfig.location}
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
            <p className="mt-4 text-small text-muted-foreground">
              Контактные данные будут добавлены позже.
            </p>

            <p className="mt-8 text-caption text-muted-foreground">
              Юридическая информация
            </p>
            <ul className="mt-4 space-y-3">
              {siteConfig.legal.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.href}
                    className="text-small text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-small text-muted-foreground">
            © {year} {siteConfig.name}
          </p>
        </div>
      </Container>
    </footer>
  );
}
