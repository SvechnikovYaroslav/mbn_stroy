import { absoluteUrl } from "@/lib/site-env";
import { seoConfig } from "@/config/seo";

/**
 * Organization / LocalBusiness JSON-LD using only confirmed fields.
 */
export function OrganizationJsonLd() {
  const url = absoluteUrl("/") || undefined;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: seoConfig.siteName,
    areaServed: seoConfig.region,
    ...(url ? { url } : {}),
    telephone: seoConfig.phone,
    address: {
      "@type": "PostalAddress",
      addressCountry: seoConfig.address.country,
      addressRegion: seoConfig.address.region,
      addressLocality: seoConfig.address.locality,
      streetAddress: seoConfig.address.street,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const url = absoluteUrl("/");
  if (!url) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: seoConfig.siteName, url }) }} />;
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
