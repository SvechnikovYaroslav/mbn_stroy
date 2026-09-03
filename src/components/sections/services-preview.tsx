import { Container } from "@/components/layout/container";

const services = [
  { number: "01", title: "Квартиры под ключ" },
  { number: "02", title: "Ванные комнаты" },
  { number: "03", title: "Дома" },
  { number: "04", title: "Отделка" },
] as const;

export function ServicesPreview() {
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

        <ul className="mt-10 divide-y divide-border border-y border-border">
          {services.map((service) => (
            <li
              key={service.number}
              className="grid grid-cols-[3.5rem_1fr] items-baseline gap-4 py-5 md:grid-cols-[5rem_1fr] md:gap-8 md:py-6"
            >
              <span className="text-caption text-muted-foreground">
                {service.number}
              </span>
              <span className="text-h3 text-foreground">{service.title}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
