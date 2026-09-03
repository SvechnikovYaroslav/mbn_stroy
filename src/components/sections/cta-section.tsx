import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { aboutCopy } from "@/config/site-copy";
import { cn } from "@/lib/utils";

/** Final homepage CTA — uses confirmed About CTA copy. */
export function CtaSection() {
  return (
    <section>
      <Container className="py-16 md:py-24">
        <div className="max-w-2xl border-t border-border pt-12 md:pt-16">
          <h2 className="text-h2 text-foreground">{aboutCopy.ctaHeading}</h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            {aboutCopy.ctaText}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacts"
              className={cn(buttonVariants({ size: "lg" }), "inline-flex h-11 px-5")}
            >
              Обсудить ремонт
            </Link>
            <Link
              href="/calculator"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "inline-flex h-11 px-5"
              )}
            >
              Рассчитать стоимость
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
