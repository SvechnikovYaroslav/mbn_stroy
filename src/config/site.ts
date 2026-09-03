export const siteConfig = {
  name: "MBN Строй",
  slogan: "Решаем задачи — меняем пространство",
  description:
    "Ремонт квартир, домов и коммерческих помещений в Туле и Тульской области.",
  location: "Тула и Тульская область",
  navigation: [
    { title: "Проекты", href: "/projects" },
    { title: "Услуги", href: "/services" },
    { title: "Калькулятор", href: "/calculator" },
    { title: "О компании", href: "#about" },
  ],
  cta: {
    title: "Обсудить ремонт",
    href: "#contact",
  },
  legal: [
    { title: "Политика конфиденциальности", href: "#" },
    {
      title: "Согласие на обработку персональных данных",
      href: "#",
    },
  ],
} as const;

export type SiteNavItem = (typeof siteConfig.navigation)[number];
