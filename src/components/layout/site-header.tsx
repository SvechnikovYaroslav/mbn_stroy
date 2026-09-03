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

function NavLink({
  href,
  className,
  children,
  onNavigate,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  const isInternal = href.startsWith("/") && !href.startsWith("//");

  if (isInternal) {
    return (
      <Link href={href} className={className} onClick={onNavigate}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} onClick={onNavigate}>
      {children}
    </a>
  );
}

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
            <NavLink
              key={item.href}
              href={item.href}
              className="text-small text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.title}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href={siteConfig.cta.href}
            className={cn(buttonVariants({ size: "default" }), "h-9 px-4")}
          >
            {siteConfig.cta.title}
          </Link>
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
                <NavLink
                  key={item.href}
                  href={item.href}
                  className="rounded-sm px-3 py-3 text-body text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onNavigate={() => setOpen(false)}
                >
                  {item.title}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto border-t border-border p-5">
              <SheetClose
                render={
                  <Link
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
