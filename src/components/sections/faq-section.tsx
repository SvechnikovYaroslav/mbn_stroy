import { Container } from "@/components/layout/container";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { faqItems } from "@/config/site-copy";

export function FaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="border-b border-border">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container className="py-14 md:py-20">
        <h2 className="text-h2 text-foreground">Частые вопросы</h2>
        <div className="mt-8 max-w-3xl border-t border-border">
          <FaqAccordion />
        </div>
      </Container>
    </section>
  );
}
