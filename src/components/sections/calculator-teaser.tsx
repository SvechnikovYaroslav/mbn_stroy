import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CalculatorTeaser() {
  return (
    <section className="border-b border-border">
      <Container className="py-14 md:py-20">
        <div className="max-w-2xl">
          <h2 className="text-h2 text-foreground">
            Сколько может стоить ремонт?
          </h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Ответьте на несколько вопросов об объекте и получите предварительный
            диапазон стоимости.
          </p>
          <Link
            href="/calculator"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex")}
          >
            Рассчитать стоимость
          </Link>
          <p className="mt-4 max-w-xl text-small text-muted-foreground">
            Расчёт предварительный. Итоговая стоимость зависит от состояния
            объекта и фактического объёма работ.
          </p>
        </div>
      </Container>
    </section>
  );
}
