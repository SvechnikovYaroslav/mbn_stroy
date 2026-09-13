export const siteConfig = {
  name: "Отделка 360",
  slogan: "Решаем задачи — меняем пространство",
  description:
    "Ремонт квартир, домов и помещений в Туле и Тульской области. Проекты, услуги и предварительный расчёт стоимости ремонта.",
  location: "Тула и Тульская область",
  navigation: [
    { title: "Проекты", href: "/projects" },
    { title: "Услуги", href: "/services" },
    { title: "Калькулятор", href: "/calculator" },
    { title: "О компании", href: "/about" },
    { title: "Контакты", href: "/contacts" },
  ],
  cta: {
    title: "Обсудить ремонт",
    href: "/contacts",
  },
} as const;

export type SiteNavItem = (typeof siteConfig.navigation)[number];

export function brandTitle(page: string): string {
  return `${page} — ${siteConfig.name}`;
}

export function brandHomeTitle(): string {
  return `${siteConfig.name} — ремонт квартир и домов в Туле`;
}
