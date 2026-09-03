import { absoluteUrl } from "@/lib/site-env";
import type { SiteSettings } from "@/types/site-settings";

type OrganizationJsonLdProps = {
  settings: SiteSettings;
};

/**
 * Organization / LocalBusiness JSON-LD using only confirmed fields.
 */
export function OrganizationJsonLd({ settings }: OrganizationJsonLdProps) {
  const url = absoluteUrl("/") || undefined;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.companyName,
    areaServed: settings.location,
    ...(url ? { url } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const itemListElement = items
    .map((item, index) => {
      const itemUrl = absoluteUrl(item.path);
      if (!itemUrl) return null;
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: itemUrl,
      };
    })
    .filter(Boolean);

  if (itemListElement.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
