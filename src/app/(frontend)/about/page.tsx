import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { aboutCopy } from "@/config/site-copy";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "О компании — MBN Строй",
  description:
    "MBN Строй — ремонт квартир и домов в Туле и Тульской области.",
};

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-border">
        <Container className="py-12 md:py-16 lg:py-20">
          <p className="text-caption text-primary">{aboutCopy.eyebrow}</p>
          <h1 className="mt-5 max-w-3xl text-display text-foreground">
            <span className="block">{aboutCopy.titleLines[0]}</span>
            <span className="block">{aboutCopy.titleLines[1]}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-body-lg text-muted-foreground">
            {aboutCopy.lead}
          </p>
        </Container>
      </section>

      <section className="border-b border-border">
        <Container className="py-14 md:py-20">
          <div className="max-w-2xl space-y-5 text-body-lg text-muted-foreground">
            {aboutCopy.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-border">
        <Container className="py-14 md:py-20">
          <h2 className="text-h2 text-foreground">
            {aboutCopy.principlesHeading}
          </h2>
          <ol className="mt-10 divide-y divide-border border-y border-border">
            {aboutCopy.principles.map((item, index) => (
              <li
                key={item.title}
                className="grid grid-cols-[3.5rem_1fr] gap-4 py-6 md:grid-cols-[5rem_1fr] md:gap-8 md:py-8"
              >
                <span className="text-caption text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-h3 text-foreground">{item.title}</h3>
                  <p className="mt-2 max-w-2xl text-body text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section>
        <Container className="py-16 md:py-24">
          <div className="max-w-2xl border-t border-border pt-12 md:pt-16">
            <h2 className="text-h2 text-foreground">{aboutCopy.ctaHeading}</h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              {aboutCopy.ctaText}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/calculator"
                className={cn(buttonVariants({ size: "lg" }), "inline-flex h-11 px-5")}
              >
                Рассчитать стоимость
              </Link>
              <Link
                href="/projects"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "inline-flex h-11 px-5"
                )}
              >
                Смотреть проекты
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
