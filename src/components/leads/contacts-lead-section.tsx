"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { LeadForm } from "@/components/leads/lead-form";
import type { LeadContextType, LeadSource } from "@/types/lead";

type ContactsLeadSectionProps = {
  submissionsDisabled?: boolean;
  heading?: string;
  intro?: string;
  commentLabel?: string;
};

function resolveContext(searchParams: URLSearchParams): {
  source: LeadSource;
  contextType?: LeadContextType;
  contextSlug?: string;
} {
  const project = searchParams.get("project")?.trim();
  if (project) {
    return {
      source: "project",
      contextType: "project",
      contextSlug: project.slice(0, 120),
    };
  }

  const service = searchParams.get("service")?.trim();
  if (service) {
    return {
      source: "service",
      contextType: "service",
      contextSlug: service.slice(0, 120),
    };
  }

  return { source: "contact" };
}

function ContactsLeadFormInner({
  submissionsDisabled = false,
  heading,
  intro,
  commentLabel,
}: ContactsLeadSectionProps) {
  const searchParams = useSearchParams();
  const context = resolveContext(searchParams);

  return (
    <LeadForm
      source={context.source}
      contextType={context.contextType}
      contextSlug={context.contextSlug}
      submissionsDisabled={submissionsDisabled}
      heading={heading}
      intro={intro}
      commentLabel={commentLabel}
    />
  );
}

export function ContactsLeadSection({
  submissionsDisabled = false,
  heading,
  intro,
  commentLabel,
}: ContactsLeadSectionProps) {
  return (
    <Suspense
      fallback={
        <LeadForm
          source="contact"
          submissionsDisabled={submissionsDisabled}
          heading={heading}
          intro={intro}
          commentLabel={commentLabel}
        />
      }
    >
      <ContactsLeadFormInner
        submissionsDisabled={submissionsDisabled}
        heading={heading}
        intro={intro}
        commentLabel={commentLabel}
      />
    </Suspense>
  );
}
