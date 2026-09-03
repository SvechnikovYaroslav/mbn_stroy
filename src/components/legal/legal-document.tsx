import type { SiteSettings } from "@/types/site-settings";

type LegalDocumentProps = {
  h1: string;
  sections: Array<{
    title: string;
    paragraphs: string[];
    list?: string[];
  }>;
  settings: SiteSettings;
  showIncompleteNotice?: boolean;
};

/**
 * Shared renderer for privacy / consent documents.
 * Never renders empty legal placeholders (ИНН: —).
 */
export function LegalDocument({
  h1,
  sections,
  settings,
  showIncompleteNotice = false,
}: LegalDocumentProps) {
  return (
    <article className="max-w-3xl">
      <h1 className="text-h1 text-foreground">{h1}</h1>
      <p className="mt-4 text-small text-muted-foreground">
        {settings.companyName} · {settings.location}
      </p>

      {showIncompleteNotice ? (
        <p className="mt-6 border border-border bg-muted/40 px-4 py-3 text-small text-muted-foreground">
          Реквизиты оператора на сайте пока заполнены не полностью. На
          публичной странице отображаются только фактически указанные данные.
        </p>
      ) : null}

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-h2 text-foreground">{section.title}</h2>
            <div className="mt-4 space-y-4 text-body text-muted-foreground">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list && section.list.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
