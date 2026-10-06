import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import { RichText } from "@payloadcms/richtext-lexical/react";

export function ProjectDescription({ data }: { data: DefaultTypedEditorState | string }) {
  if (typeof data === "string") return <p className="max-w-3xl text-body-lg leading-relaxed text-muted-foreground">{data}</p>;
  return <div className="max-w-3xl text-body-lg text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-foreground [&_h2]:mt-8 [&_h2]:text-h2 [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:text-h3 [&_h3]:text-foreground [&_li]:my-1 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_p]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6">
    <RichText data={data} />
  </div>;
}
