import Link from "next/link";

import type { Service } from "@/types/service";

type ServiceIndexProps = {
  services: Service[];
};

export function ServiceIndex({ services }: ServiceIndexProps) {
  return (
    <ul className="border-t border-border">
      {services.map((service, index) => (
        <li key={service.id} className="border-b border-border transition-colors hover:border-primary">
          <Link
            href={`/services/${service.slug}`}
            className="service-row-link group grid gap-x-4 gap-y-3 py-5 transition-colors hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-start sm:py-6"
          >
            <span className="text-caption text-muted-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="text-h3 text-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary">
              {service.title}
            </h2>
            <span aria-hidden="true" className="hidden text-h3 text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary group-focus-visible:translate-x-1 group-focus-visible:text-primary sm:block">
              →
            </span>
            {service.shortDescription ? (
              <p className="col-span-2 max-w-xl line-clamp-2 text-body text-muted-foreground sm:col-start-2 sm:col-end-4">
                {service.shortDescription}
              </p>
            ) : null}
            <span aria-hidden="true" className="col-start-2 text-small text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary group-focus-visible:translate-x-1 group-focus-visible:text-primary sm:hidden">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
