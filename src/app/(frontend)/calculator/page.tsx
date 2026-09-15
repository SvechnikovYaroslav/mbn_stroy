import type { Metadata } from "next";

import { CalculatorWizard } from "@/components/calculator/calculator-wizard";
import { Container } from "@/components/layout/container";
import { ensureCalculatorDynamic } from "@/lib/calculator/dynamic";
import { brandTitle } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { getCalculatorConfig } from "@/lib/calculator";

export const metadata: Metadata = pageMetadata({ pathname: "/calculator", title: brandTitle("Калькулятор стоимости ремонта в Туле"), description: "Рассчитайте предварительный диапазон стоимости ремонта квартиры, дома или помещения в Туле и Тульской области." });

export default async function CalculatorPage() {
  await ensureCalculatorDynamic();
  const config = await getCalculatorConfig();

  return (
    <main>
      <section className="border-b border-border">
        <Container className="py-12 md:py-16">
          <h1 className="text-h1 text-foreground">Калькулятор ремонта</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
            Ответьте на несколько вопросов и получите предварительный диапазон
            стоимости ремонта в Туле и Тульской области.
          </p>
        </Container>
      </section>

      <section>
        <Container className="py-10 md:py-14">
          <CalculatorWizard config={config} />
        </Container>
      </section>
    </main>
  );
}
