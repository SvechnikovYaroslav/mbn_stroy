import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section id="contact" className="scroll-mt-20">
      <Container className="py-16 md:py-24">
        <div className="max-w-2xl border-t border-border pt-12 md:pt-16">
          <h2 className="text-h2 text-foreground">Планируете ремонт?</h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Расскажите о задаче — поможем оценить объём работ и предварительную
            стоимость.
          </p>
          <a
            href={siteConfig.cta.href}
            className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex h-11 px-5")}
          >
            {siteConfig.cta.title}
          </a>
        </div>
      </Container>
    </section>
  );
}
