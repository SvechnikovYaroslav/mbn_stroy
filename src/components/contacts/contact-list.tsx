import { getContactChannels } from "@/lib/site-settings";
import type { SiteSettings } from "@/types/site-settings";
import { cn } from "@/lib/utils";

type ContactListProps = {
  settings: SiteSettings;
  className?: string;
  /** When false, skip the always-shown location row (e.g. footer already shows it). */
  includeLocation?: boolean;
};

export function ContactList({
  settings,
  className,
  includeLocation = true,
}: ContactListProps) {
  const channels = getContactChannels(settings).filter(
    (item) => includeLocation || item.key !== "location"
  );

  if (channels.length === 0) {
    return null;
  }

  return (
    <ul className={cn("space-y-5", className)}>
      {channels.map((item) => (
        <li key={item.key}>
          <p className="text-caption text-muted-foreground">{item.label}</p>
          {item.href ? (
            <a
              href={item.href}
              className="mt-1 inline-block text-body text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...(item.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {item.value}
            </a>
          ) : (
            <p className="mt-1 text-body text-foreground">{item.value}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
