import { CtaSection } from "@/components/sections/cta-section";
import { Hero } from "@/components/sections/hero";
import { ProjectsPreview } from "@/components/sections/projects-preview";
import { ServicesPreview } from "@/components/sections/services-preview";

export default function Home() {
  return (
    <main>
      <Hero />
      <ServicesPreview />
      <div id="calculator" className="scroll-mt-20" aria-hidden="true" />
      <div id="about" className="scroll-mt-20" aria-hidden="true" />
      <ProjectsPreview />
      <CtaSection />
    </main>
  );
}
