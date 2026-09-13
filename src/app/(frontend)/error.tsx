"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <Container className="py-16 md:py-24">
        <p className="text-caption text-muted-foreground">Ошибка</p>
        <h1 className="mt-4 text-h1 text-foreground">Не удалось загрузить страницу</h1>
        <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">
          Попробуйте обновить страницу или вернуться на главную. Если ошибка
          повторяется, свяжитесь с нами через страницу контактов.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className={cn(buttonVariants({ size: "lg" }), "inline-flex")}
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "inline-flex"
            )}
          >
            На главную
          </Link>
        </div>
      </Container>
    </main>
  );
}
