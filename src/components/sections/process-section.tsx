import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { processSteps } from "@/config/site-copy";

export function ProcessSection() {
  return (
    <section className="border-b border-border">
      <Reveal className="motion-section"><Container className="py-14 md:py-20">
        <div className="max-w-2xl">
          <h2 className="text-h2 text-foreground">Как проходит работа</h2>
          <p className="mt-4 text-body text-muted-foreground">
            Начинаем с задачи и постепенно уточняем объём ремонта, материалы и
            последовательность работ.
          </p>
        </div>

        <ol className="motion-stagger mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {processSteps.map((step, index) => (
            <li key={step.title} className="motion-stagger-item min-w-0">
              <p className="text-caption text-primary">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-h3 text-foreground">{step.title}</h3>
              <p className="mt-2 text-small text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container></Reveal>
    </section>
  );
}
