import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { LegalMarkdown } from "@/components/legal/legal-markdown";
import { getLegalDocument, isLegalDocumentSlug, legalDocuments } from "@/lib/legal/registry";
import { pageMetadata } from "@/config/seo";

type Props = { params: Promise<{ document: string; version?: string[] }> };

export function generateStaticParams() {
  return Object.entries(legalDocuments).flatMap(([document, item]) =>
    Object.keys(item.versions).map((version) => ({ document, version: [version] }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { document, version } = await params;
  if (!isLegalDocumentSlug(document)) return {};
  const item = getLegalDocument(document, version?.[0]);
  if (!item) return {};
  const path = `/legal/${document}${version?.[0] ? `/${version[0]}` : ""}`;
  return {
    ...pageMetadata({ pathname: path, title: item.title, description: `${item.title}. Редакция ${item.version} от ${item.effectiveDate}.` }),
    robots: { index: false, follow: true },
  };
}

export default async function LegalPage({ params }: Props) {
  const { document, version } = await params;
  if (!isLegalDocumentSlug(document) || (version && version.length !== 1)) notFound();
  const item = getLegalDocument(document, version?.[0]);
  if (!item) notFound();
  return (
    <main>
      <Container className="py-12 md:py-16 lg:py-20">
        <LegalMarkdown markdown={item.markdown} />
        <p className="mt-10 max-w-3xl text-small text-muted-foreground">
          Архив редакций: <Link className="underline underline-offset-4" href={`/legal/${document}/${item.version}`}>редакция {item.version} от {item.effectiveDate}</Link>.
        </p>
      </Container>
    </main>
  );
}
