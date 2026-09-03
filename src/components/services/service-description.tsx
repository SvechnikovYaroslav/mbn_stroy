import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import { RichText } from "@payloadcms/richtext-lexical/react";

type ServiceDescriptionProps = {
  data: DefaultTypedEditorState;
};

export function ServiceDescription({ data }: ServiceDescriptionProps) {
  return (
    <div className="service-richtext max-w-2xl space-y-4 text-body-lg text-muted-foreground [&_a]:underline [&_h2]:text-h2 [&_h2]:text-foreground [&_h3]:text-h3 [&_h3]:text-foreground [&_li]:my-1 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5">
      <RichText data={data} />
    </div>
  );
}
