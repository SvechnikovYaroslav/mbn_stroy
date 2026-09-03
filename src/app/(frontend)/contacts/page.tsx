import type { Metadata } from "next";
import Link from "next/link";

import { ContactList } from "@/components/contacts/contact-list";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { ensureSiteSettingsDynamic } from "@/lib/site-settings/dynamic";
import { getSiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Контакты — MBN Строй",
  description:
    "Связаться с MBN Строй по вопросам ремонта квартир и домов в Туле и Тульской области.",
};

export default async function ContactsPage() {
  await ensureSiteSettingsDynamic();
  const settings = await getSiteSettings();

  return (
    <main>
      <section className="border-b border-border">
        <Container className="py-12 md:py-16 lg:py-20">
          <h1 className="text-h1 text-foreground">Контакты</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
            Расскажите об объекте и необходимых работах. Для предварительной
            оценки можно также воспользоваться калькулятором стоимости.
          </p>
        </Container>
      </section>

      <section className="border-b border-border">
        <Container className="py-14 md:py-20">
          <h2 className="text-h2 text-foreground">Связаться с нами</h2>
          <div className="mt-10 max-w-md">
            <ContactList settings={settings} />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-14 md:py-20">
          <div className="max-w-2xl">
            <h2 className="text-h2 text-foreground">
              Хотите сначала оценить стоимость?
            </h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              Ответьте на несколько вопросов об объекте и получите
              предварительный диапазон стоимости ремонта.
            </p>
            <Link
              href="/calculator"
              className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex")}
            >
              Открыть калькулятор
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
