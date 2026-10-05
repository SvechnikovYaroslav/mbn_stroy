"use client";

import { ChevronDownIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { ProjectCard } from "@/components/projects/project-card";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { catalogProjectTypeFilters, catalogSectionFilters, catalogWorkTypeFilters, type CatalogProjectTypeFilter, type CatalogSectionFilter, type CatalogWorkTypeFilter } from "@/config/project";
import { filterProjects } from "@/lib/projects/filter";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

type FilterOption<T extends string> = { id: T; label: string };
type ProjectCatalogProps = { projects: Project[] };

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function ObjectTypeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("h-11 rounded-lg border px-4 text-small font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-transparent text-muted-foreground hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground")}>{label}</button>;
}

function CheckList<T extends string>({ title, options, selected, onToggle, onClear }: { title: string; options: FilterOption<T>[]; selected: T[]; onToggle: (value: T) => void; onClear: () => void }) {
  const listId = useId();
  return <fieldset>
    <legend className="text-caption text-muted-foreground">{title}</legend>
    <div className="mt-3 grid gap-1">
      {options.map((option) => {
        const inputId = `${listId}-${option.id}`;
        return <label key={option.id} htmlFor={inputId} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-small text-foreground transition-colors hover:bg-muted">
          <input id={inputId} type="checkbox" checked={selected.includes(option.id)} onChange={() => onToggle(option.id)} className="size-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          {option.label}
        </label>;
      })}
    </div>
    {selected.length > 0 && <button type="button" onClick={onClear} className="mt-3 text-small text-primary transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Сбросить</button>}
  </fieldset>;
}

function FilterPopover<T extends string>({ label, title, options, selected, onToggle, onClear }: { label: string; title: string; options: FilterOption<T>[]; selected: T[]; onToggle: (value: T) => void; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener("mousedown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div ref={rootRef} className="relative">
    <button ref={triggerRef} type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-haspopup="dialog" className="flex h-11 items-center gap-2 rounded-lg border border-primary bg-transparent px-4 text-small font-medium text-primary transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-primary hover:text-primary-foreground hover:shadow-[0_10px_20px_-14px_var(--gold-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-expanded:bg-primary aria-expanded:text-primary-foreground">
      {selected.length ? `${label} · ${selected.length}` : label}<ChevronDownIcon className={cn("size-4 transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
    </button>
    {open && <div role="dialog" aria-label={title} className="absolute left-0 z-30 mt-2 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-[0_20px_45px_-24px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-top-1 duration-200"><CheckList title={title} options={options} selected={selected} onToggle={onToggle} onClear={onClear} /></div>}
  </div>;
}

export function ProjectCatalog({ projects }: ProjectCatalogProps) {
  const [projectType, setProjectType] = useState<CatalogProjectTypeFilter>("all");
  const [workTypes, setWorkTypes] = useState<CatalogWorkTypeFilter[]>([]);
  const [sectionTypes, setSectionTypes] = useState<CatalogSectionFilter[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const filtered = useMemo(() => filterProjects({ projectType, workTypes, sectionTypes }, projects), [projectType, workTypes, sectionTypes, projects]);
  const hasSelections = workTypes.length > 0 || sectionTypes.length > 0 || projectType !== "all";
  const clearAll = () => { setProjectType("all"); setWorkTypes([]); setSectionTypes([]); };
  const selectedChips = [...catalogWorkTypeFilters.filter((item) => workTypes.includes(item.id)), ...catalogSectionFilters.filter((item) => sectionTypes.includes(item.id))];

  const roomContext = sectionTypes.length === 1 ? sectionTypes[0] : undefined;
  return <div>
    <div className="border-b border-border pb-6 md:pb-7">
      <div className="flex flex-wrap items-center gap-2 md:gap-3" role="group" aria-label="Фильтры проектов">
        {catalogProjectTypeFilters.map((item) => <ObjectTypeButton key={item.id} label={item.label} active={projectType === item.id} onClick={() => setProjectType(item.id)} />)}
        <div className="hidden items-center gap-2 md:flex md:pl-2">
          <FilterPopover label="Вид работ" title="Вид работ" options={catalogWorkTypeFilters} selected={workTypes} onToggle={(value) => setWorkTypes((current) => toggleValue(current, value))} onClear={() => setWorkTypes([])} />
          <FilterPopover label="Помещение" title="Помещения" options={catalogSectionFilters} selected={sectionTypes} onToggle={(value) => setSectionTypes((current) => toggleValue(current, value))} onClear={() => setSectionTypes([])} />
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="flex h-11 items-center gap-2 rounded-lg border border-primary bg-transparent px-4 text-small font-medium text-primary transition-[background-color,border-color,color] duration-200 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden" aria-label="Открыть фильтры"><SlidersHorizontalIcon className="size-4" aria-hidden="true" />{workTypes.length + sectionTypes.length ? `Фильтры · ${workTypes.length + sectionTypes.length}` : "Фильтры"}</SheetTrigger>
          <SheetContent side="bottom" className="max-h-[min(82dvh,42rem)] rounded-t-xl border-border p-0" showCloseButton={false}>
            <SheetHeader className="flex-row items-center justify-between border-b border-border px-5 py-4"><SheetTitle>Фильтры</SheetTitle><button type="button" onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Закрыть фильтры"><XIcon className="size-5" /></button></SheetHeader>
            <div className="min-h-0 overflow-y-auto px-5 py-5"><CheckList title="Вид работ" options={catalogWorkTypeFilters} selected={workTypes} onToggle={(value) => setWorkTypes((current) => toggleValue(current, value))} onClear={() => setWorkTypes([])} /><div className="my-5 border-t border-border" /><CheckList title="Помещения" options={catalogSectionFilters} selected={sectionTypes} onToggle={(value) => setSectionTypes((current) => toggleValue(current, value))} onClear={() => setSectionTypes([])} /></div>
            <SheetFooter className="grid grid-cols-2 gap-3 border-t border-border bg-popover p-4"><button type="button" onClick={clearAll} disabled={!hasSelections} className="h-11 rounded-lg border border-border px-4 text-small font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Сбросить</button><button type="button" onClick={() => setMobileOpen(false)} className="h-11 rounded-lg border border-primary bg-primary px-4 text-small font-medium text-primary-foreground transition-[background-color,border-color,color] hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Показать {filtered.length} {filtered.length === 1 ? "проект" : "проектов"}</button></SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      {selectedChips.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2">{selectedChips.map((item) => {
        const isWorkType = catalogWorkTypeFilters.some((filter) => filter.id === item.id);
        return <button key={item.id} type="button" onClick={() => isWorkType ? setWorkTypes((current) => current.filter((value) => value !== item.id)) : setSectionTypes((current) => current.filter((value) => value !== item.id))} className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-muted px-2.5 text-small text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.label}<XIcon className="size-3.5" aria-hidden="true" /><span className="sr-only">Удалить фильтр {item.label}</span></button>;
      })}<button type="button" onClick={clearAll} className="h-8 px-1 text-small text-primary transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Сбросить всё</button></div>}
    </div>
    {filtered.length === 0 ? <div className="mt-10 border border-border bg-surface p-6 md:p-8"><p className="text-body text-foreground">По выбранным параметрам проектов не найдено.</p><button type="button" onClick={clearAll} className="mt-4 h-10 rounded-lg border border-primary px-4 text-small font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Сбросить фильтры</button></div> : <ul className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">{filtered.map((project) => <li key={project.id}><ProjectCard project={project} room={roomContext} /></li>)}</ul>}
  </div>;
}
