/** Canonical work types for idempotent seeds. Do not change existing slugs. */
export const workTypesSeed = [
  { title: "Отделка", slug: "finishing", sortOrder: 10 },
  { title: "Электрика", slug: "electrical", sortOrder: 20 },
  { title: "Сантехника", slug: "plumbing", sortOrder: 30 },
  { title: "Натяжные потолки", slug: "stretch-ceilings", sortOrder: 40 },
  { title: "Окна", slug: "windows", sortOrder: 50 },
  { title: "Полы", slug: "flooring", sortOrder: 60 },
  { title: "Плиточные работы", slug: "tiling", sortOrder: 70 },
  { title: "Малярные работы", slug: "painting", sortOrder: 80 },
  { title: "Демонтаж", slug: "demolition", sortOrder: 90 },
  { title: "Двери", slug: "doors", sortOrder: 100 },
  { title: "Отопление", slug: "heating", sortOrder: 110 },
  { title: "Другие работы", slug: "other", sortOrder: 120 },
] as const;
