import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="border-b border-border">
      <Container className="grid gap-10 py-12 md:gap-12 md:py-16 lg:grid-cols-12 lg:items-end lg:gap-10 lg:py-20">
        <div className="lg:col-span-6">
          <p className="text-caption text-primary">{siteConfig.slogan}</p>
          <h1 className="mt-5 text-display text-foreground">
            <span className="block">Ремонт, который</span>
            <span className="block break-words">меняет пространство.</span>
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-muted-foreground">
            Ремонт квартир и домов в Туле и Тульской области. От первого замера
            до готового пространства.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#calculator"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
            >
              Рассчитать стоимость
            </a>
            <a
              href="#projects"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-5"
              )}
            >
              Смотреть проекты
            </a>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div
            className="flex aspect-[8/5] w-full flex-col items-center justify-center border border-border bg-muted/60 text-center"
            role="img"
            aria-label="Место для будущего фото интерьера, 1920 на 1200"
          >
            <p className="text-caption text-muted-foreground">Project image</p>
            <p className="mt-2 text-small text-muted-foreground">1920 × 1200</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
