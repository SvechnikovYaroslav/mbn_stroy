import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CalculatorTeaser() {
  return (
    <section id="calculator" className="scroll-mt-20 border-b border-border">
      <Container className="py-14 md:py-20">
        <div className="max-w-2xl">
          <h2 className="text-h2 text-foreground">
            Рассчитайте стоимость ремонта
          </h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Ответьте на несколько вопросов и получите предварительный диапазон
            стоимости.
          </p>
          <Link
            href="/calculator"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex")}
          >
            Рассчитать стоимость
          </Link>
        </div>
      </Container>
    </section>
  );
}
