import { Container } from "@/components/layout/container";
import { whyMbnItems } from "@/config/site-copy";

export function WhyMbnSection() {
  return (
    <section className="border-b border-border">
      <Container className="py-14 md:py-20">
        <h2 className="text-h2 text-foreground">Почему MBN Строй</h2>

        <ol className="mt-10 divide-y divide-border border-y border-border">
          {whyMbnItems.map((item, index) => (
            <li
              key={item.title}
              className="grid grid-cols-[3.5rem_1fr] gap-4 py-6 md:grid-cols-[5rem_1fr] md:gap-8 md:py-8"
            >
              <span className="text-caption text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-h3 text-foreground">{item.title}</h3>
                <p className="mt-2 max-w-2xl text-body text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
