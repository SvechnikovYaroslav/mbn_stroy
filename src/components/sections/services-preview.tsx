import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { getFeaturedServices } from "@/lib/services";
import { ensureServicesDynamic } from "@/lib/services/dynamic";

export async function ServicesPreview() {
  await ensureServicesDynamic();
  const services = await getFeaturedServices(6);

  return (
    <section className="border-b border-border">
      <Reveal className="motion-section"><Container className="py-14 md:py-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="text-h2 text-foreground">Что мы делаем</h2>
          <p className="max-w-md text-body text-muted-foreground">
            Комплексный ремонт и отдельные виды работ для квартир и домов.
            Состав работ подбирается под конкретный объект и его состояние.
          </p>
        </div>

        {services.length === 0 ? (
          <p className="mt-10 text-body text-muted-foreground">
            Список услуг скоро появится.
          </p>
        ) : (
          <ul className="motion-stagger mt-10 divide-y divide-border border-y border-border">
            {services.map((service, index) => (
              <li key={service.id} className="motion-stagger-item">
                <Link
                  href={`/services/${service.slug}`}
                  className="service-row-link group grid grid-cols-[3.5rem_1fr] items-baseline gap-4 py-5 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[5rem_1fr] md:gap-8 md:py-6"
                >
                  <span className="text-caption text-primary transition-colors group-hover:text-gold-light group-focus-visible:text-gold-light">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-h3 text-foreground transition-colors group-hover:text-gold-light group-focus-visible:text-gold-light">
                      {service.title}<span aria-hidden="true" className="ml-2 inline-block text-muted-foreground transition-transform duration-[var(--motion-fast)] ease-[var(--motion-ease)] group-hover:translate-x-1 group-hover:text-primary group-focus-visible:translate-x-1 group-focus-visible:text-primary">→</span>
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
            className="cta-text-link text-small text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Все услуги <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container></Reveal>
    </section>
  );
}
