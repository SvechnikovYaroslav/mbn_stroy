import type { GlobalConfig } from "payload";

import { authenticated } from "@/access";

/**
 * Editable contact / brand fields for the public site.
 * Marketing copy stays in code (config), not here.
 */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Настройки сайта",
  admin: {
    description:
      "Контакты и базовые данные компании для шапки, подвала и страницы «Контакты».",
    group: "Сайт",
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      type: "collapsible",
      label: "Бренд",
      admin: {
        initCollapsed: true,
        description: "Обычно не нужно менять. Значения по умолчанию уже заданы.",
      },
      fields: [
        {
          name: "companyName",
          type: "text",
          label: "Название компании",
          defaultValue: "MBN Строй",
        },
        {
          name: "slogan",
          type: "text",
          label: "Слоган",
          defaultValue: "Решаем задачи — меняем пространство",
        },
        {
          name: "location",
          type: "text",
          label: "География",
          defaultValue: "Тула и Тульская область",
        },
      ],
    },
    {
      type: "group",
      name: "contacts",
      label: "Контакты",
      admin: {
        description:
          "Пустые поля на сайте не показываются. Не заполняйте заглушками.",
      },
      fields: [
        {
          name: "phone",
          type: "text",
          label: "Телефон",
          admin: {
            description: "Например: +7 (4872) 00-00-00",
          },
        },
        {
          name: "email",
          type: "email",
          label: "Email",
        },
        {
          name: "telegram",
          type: "text",
          label: "Telegram",
          admin: {
            description: "URL (https://t.me/…) или username (@name / name).",
          },
        },
        {
          name: "whatsapp",
          type: "text",
          label: "WhatsApp",
          admin: {
            description: "URL (https://wa.me/…) или номер (+79001234567).",
          },
        },
        {
          name: "workingHours",
          type: "text",
          label: "Время работы",
          admin: {
            description: "Например: Пн–Пт, 10:00–19:00",
          },
        },
      ],
    },
  ],
};
