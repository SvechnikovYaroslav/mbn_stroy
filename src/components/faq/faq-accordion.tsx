"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/config/site-copy";

type FaqAccordionProps = {
  className?: string;
};

export function FaqAccordion({ className }: FaqAccordionProps) {
  return (
    <Accordion className={className}>
      {faqItems.map((item, index) => (
        <AccordionItem
          key={item.question}
          value={`faq-${index}`}
          className="border-border"
        >
          <AccordionTrigger className="py-5 text-left text-body font-medium text-foreground hover:no-underline md:text-body-lg">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-body text-muted-foreground">
            <p>{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
