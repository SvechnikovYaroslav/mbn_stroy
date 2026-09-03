import type { Metadata } from "next";

import { CalculatorTeaser } from "@/components/sections/calculator-teaser";
import { CtaSection } from "@/components/sections/cta-section";
import { FaqSection } from "@/components/sections/faq-section";
import { Hero } from "@/components/sections/hero";
import { ProcessSection } from "@/components/sections/process-section";
import { ProjectsPreview } from "@/components/sections/projects-preview";
import { ServicesPreview } from "@/components/sections/services-preview";
import { WhyMbnSection } from "@/components/sections/why-mbn-section";

export const metadata: Metadata = {
  title: "MBN Строй — ремонт квартир и домов в Туле",
  description:
    "Ремонт квартир, домов и помещений в Туле и Тульской области. Проекты, услуги и предварительный расчёт стоимости ремонта.",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <ServicesPreview />
      <ProjectsPreview />
      <WhyMbnSection />
      <ProcessSection />
      <CalculatorTeaser />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
