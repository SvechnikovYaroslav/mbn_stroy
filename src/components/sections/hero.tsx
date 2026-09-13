import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { mediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/images/hero/otdelka-360-hero.webp";
const HERO_ALT =
  "Интерьер квартиры после ремонта — тёплый свет в современном жилом пространстве";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl(HERO_IMAGE)}
          alt=""
          className="h-full w-full object-cover object-center"
          width={1920}
          height={1272}
          decoding="async"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/25"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40"
          aria-hidden="true"
        />
      </div>

      <Container className="relative z-10 flex min-h-[32rem] flex-col justify-end py-14 md:min-h-[40rem] md:py-20 lg:min-h-[44rem]">
        <div className="max-w-2xl">
          <p className="text-caption text-primary">
            {siteConfig.name} · Тула
          </p>
          <h1 className="mt-5 text-display text-foreground">
            <span className="block">Ремонт, который</span>
            <span className="block break-words">меняет пространство.</span>
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-muted-foreground">
            Ремонт квартир и домов в Туле и Тульской области.
            <br />
            Берём задачу целиком — от оценки объёма работ до готового
            пространства.
          </p>
          <p className="mt-4 text-small text-muted-foreground">
            {siteConfig.slogan}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/calculator"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
            >
              Рассчитать стоимость
            </Link>
            <Link
              href="/projects"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-5"
              )}
            >
              Смотреть проекты
            </Link>
          </div>
        </div>
      </Container>
      <span className="sr-only">{HERO_ALT}</span>
    </section>
  );
}
