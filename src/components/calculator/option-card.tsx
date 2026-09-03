"use client";

import { cn } from "@/lib/utils";

type OptionCardProps = {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  type?: "radio" | "checkbox";
  name?: string;
};

export function OptionCard({
  label,
  description,
  selected,
  onSelect,
  type = "radio",
  name,
}: OptionCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-1 border px-4 py-3 transition-colors",
        "focus-within:ring-2 focus-within:ring-ring",
        selected
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-transparent text-foreground hover:border-foreground"
      )}
    >
      <span className="flex items-start gap-3">
        <input
          type={type}
          name={name}
          checked={selected}
          onChange={onSelect}
          className="mt-1 size-4 shrink-0 accent-current"
        />
        <span className="min-w-0">
          <span className="block text-body font-medium">{label}</span>
          {description ? (
            <span
              className={cn(
                "mt-1 block text-small",
                selected ? "text-background/80" : "text-muted-foreground"
              )}
            >
              {description}
            </span>
          ) : null}
        </span>
      </span>
    </label>
  );
}
