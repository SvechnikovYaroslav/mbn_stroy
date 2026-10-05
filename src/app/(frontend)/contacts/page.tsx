import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ContactsLeadSection } from "@/components/leads/contacts-lead-section";
import { buttonVariants } from "@/components/ui/button";
import { brandTitle, siteConfig } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { ensureSiteSettingsDynamic } from "@/lib/site-settings/dynamic";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  pathname: "/contacts",
  title: brandTitle("Контакты в Туле"),
  description: `Связаться с ${siteConfig.name} по вопросам ремонта квартир, домов и отдельных помещений в Туле и Тульской области.`,
});

export default async function ContactsPage() {
  await ensureSiteSettingsDynamic();

  return (
    <main>
      <section className="border-b border-border">
        <Container className="py-10 md:py-12 lg:py-14">
          <h1 className="text-h1 text-foreground">Контакты</h1>
          <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">
            Оставьте заявку — свяжемся с вами и уточним детали ремонта.
          </p>

          <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)] lg:gap-14">
            <div className="order-2 lg:order-1">
              <ContactsLeadSection
                heading="Заявка на ремонт"
                intro="Оставьте контакты и кратко опишите объект."
                commentLabel="Что нужно сделать?"
              />
            </div>

            <aside className="order-1 border-b border-border pb-8 lg:order-2 lg:border-b-0 lg:border-l lg:pb-0 lg:pl-10" aria-label="Способы связи">
              <section>
                <h2 className="text-h3 text-foreground">Связаться напрямую</h2>
                <a
                  href="tel:+79207414124"
                  className="mt-5 inline-block text-h2 text-foreground underline-offset-8 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  +7 920 741-41-24
                </a>
                <p className="mt-2 text-small text-muted-foreground">Тула и Тульская область</p>
              </section>

              <section className="mt-8 border-t border-border pt-8">
                <h2 className="text-h3 text-foreground">Сначала оценить стоимость</h2>
                <p className="mt-3 text-body text-muted-foreground">
                  Ответьте на несколько вопросов и получите предварительную оценку ремонта.
                </p>
                <Link href="/calculator" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "mt-6 inline-flex")}>
                  Открыть калькулятор
                </Link>
              </section>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
