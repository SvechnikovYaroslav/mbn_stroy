import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/layout/container";
import { ServiceIndex } from "@/components/services/service-index";
import { brandTitle } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { ensureServicesDynamic } from "@/lib/services/dynamic";
import { getServices } from "@/lib/services";

export const metadata: Metadata = pageMetadata({
  pathname: "/services",
  title: brandTitle("Услуги по ремонту в Туле"),
  description: "Ремонт и отделочные работы для квартир и домов в Туле и Тульской области.",
});

export default async function ServicesPage() {
  await ensureServicesDynamic();
  const services = await getServices();

  return (
    <main>
      <section>
        <Container className="py-10 md:py-12 lg:py-14">
          <h1 className="text-h1 text-foreground">Услуги</h1>
          <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">
            Ремонт и отделочные работы для квартир и домов в Туле и Тульской области.
          </p>

          {services.length === 0 ? (
            <p className="py-10 text-body text-muted-foreground">Список услуг скоро появится.</p>
          ) : (
            <div className="mt-8 gap-12 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16 xl:gap-20">
              <div className="mb-10 lg:mb-0">
                <div className="overflow-hidden bg-muted lg:sticky lg:top-24 lg:h-[clamp(520px,65vh,720px)]">
                  <Image
                    src="/images/services/services-hero.jpg"
                    alt="Современный интерьер"
                    width={1200}
                    height={788}
                    priority
                    sizes="(min-width: 1280px) 42vw, (min-width: 1024px) 40vw, 100vw"
                    className="h-auto w-full object-cover lg:h-full"
                  />
                </div>
              </div>
              <ServiceIndex services={services} />
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
