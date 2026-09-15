import type { Metadata } from "next";

import { CalculatorTeaser } from "@/components/sections/calculator-teaser";
import { CtaSection } from "@/components/sections/cta-section";
import { FaqSection } from "@/components/sections/faq-section";
import { Hero } from "@/components/sections/hero";
import { ProcessSection } from "@/components/sections/process-section";
import { ProjectsPreview } from "@/components/sections/projects-preview";
import { ServicesPreview } from "@/components/sections/services-preview";
import { WhyMbnSection } from "@/components/sections/why-mbn-section";
import { pageMetadata, seoConfig } from "@/config/seo";

export const metadata: Metadata = pageMetadata({ pathname: "/", title: seoConfig.defaultTitle, description: seoConfig.defaultDescription });

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
