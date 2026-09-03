"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container className="flex h-14 items-center justify-between gap-4 lg:h-16">
        <Link
          href="/"
          className="text-small font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {siteConfig.name}
        </Link>

        <nav
          aria-label="Основная навигация"
          className="hidden items-center gap-8 md:flex"
        >
          {siteConfig.navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-small text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.title}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href={siteConfig.cta.href}
            className={cn(buttonVariants({ size: "default" }), "h-9 px-4")}
          >
            {siteConfig.cta.title}
          </a>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "md:hidden"
            )}
            aria-label="Открыть меню"
          >
            <MenuIcon aria-hidden="true" />
          </SheetTrigger>

          <SheetContent side="right" className="w-full max-w-xs gap-0 p-0">
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle>{siteConfig.name}</SheetTitle>
            </SheetHeader>

            <nav
              aria-label="Мобильная навигация"
              className="flex flex-col gap-1 px-3 py-4"
            >
              {siteConfig.navigation.map((item) => (
                <SheetClose
                  key={item.href}
                  render={
                    <a
                      href={item.href}
                      className="rounded-sm px-3 py-3 text-body text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => setOpen(false)}
                    />
                  }
                >
                  {item.title}
                </SheetClose>
              ))}
            </nav>

            <div className="mt-auto border-t border-border p-5">
              <SheetClose
                render={
                  <a
                    href={siteConfig.cta.href}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-11 w-full px-4"
                    )}
                    onClick={() => setOpen(false)}
                  />
                }
              >
                {siteConfig.cta.title}
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
