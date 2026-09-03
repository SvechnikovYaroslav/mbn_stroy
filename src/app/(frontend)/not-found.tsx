import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main>
      <Container className="py-16 md:py-24">
        <p className="text-caption text-muted-foreground">404</p>
        <h1 className="mt-4 text-h1 text-foreground">Страница не найдена</h1>
        <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">
          Такой страницы нет или она была удалена. Можно вернуться на главную
          или открыть проекты.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className={cn(buttonVariants({ size: "lg" }), "inline-flex")}
          >
            На главную
          </Link>
          <Link
            href="/projects"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "inline-flex"
            )}
          >
            Смотреть проекты
          </Link>
        </div>
      </Container>
    </main>
  );
}
