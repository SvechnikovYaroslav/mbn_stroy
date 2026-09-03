import Link from "next/link";

import { Container } from "@/components/layout/container";
import { getFeaturedServices } from "@/lib/services";
import { ensureServicesDynamic } from "@/lib/services/dynamic";

export async function ServicesPreview() {
  await ensureServicesDynamic();
  const services = await getFeaturedServices(6);

  return (
    <section id="services" className="scroll-mt-20 border-b border-border">
      <Container className="py-14 md:py-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="text-h2 text-foreground">Что мы делаем</h2>
          <p className="max-w-md text-body text-muted-foreground">
            Ремонт отдельных помещений и работы под ключ — с акцентом на
            точность и качество пространства.
          </p>
        </div>

        {services.length === 0 ? (
          <p className="mt-10 text-body text-muted-foreground">
            Список услуг скоро появится.
          </p>
        ) : (
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {services.map((service, index) => (
              <li key={service.id}>
                <Link
                  href={`/services/${service.slug}`}
                  className="grid grid-cols-[3.5rem_1fr] items-baseline gap-4 py-5 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[5rem_1fr] md:gap-8 md:py-6"
                >
                  <span className="text-caption text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-h3 text-foreground">
                      {service.title}
                    </span>
                    {service.shortDescription ? (
                      <span className="mt-1 block text-small text-muted-foreground">
                        {service.shortDescription}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <Link
            href="/services"
            className="text-small text-foreground underline-offset-4 hover:underline"
          >
            Все услуги →
          </Link>
        </div>
      </Container>
    </section>
  );
}
