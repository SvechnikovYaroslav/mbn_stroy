import type { CollectionConfig } from "payload";

import { authenticated } from "@/access";

/**
 * Public leads are created only via Local API (overrideAccess)
 * from our validated server action — never via anonymous REST create.
 */
export const Leads: CollectionConfig = {
  slug: "leads",
  labels: {
    singular: "Заявка",
    plural: "Заявки",
  },
  admin: {
    useAsTitle: "displayTitle",
    defaultColumns: [
      "status",
      "createdAt",
      "name",
      "phone",
      "email",
      "source",
      "hasCalculatorSnapshot",
    ],
    description: "Заявки с сайта. Публичный доступ к списку закрыт.",
    listSearchableFields: ["name", "phone", "email", "comment"],
    group: "Сайт",
  },
  defaultSort: "-createdAt",
  access: {
    create: () => false,
    read: authenticated,
    update: authenticated,
    // Production: use status workflow (completed / spam). Dev may delete test rows.
    delete: () => process.env.NODE_ENV === "development",
  },
  fields: [
    {
      name: "displayTitle",
      type: "text",
      label: "Заголовок",
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            const name = data?.name?.trim();
            const phone = data?.phone?.trim();
            const email = data?.email?.trim();
            if (name) return name;
            if (phone) return phone;
            if (email) return email;
            return "Заявка";
          },
        ],
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Контакт",
          fields: [
            {
              name: "name",
              type: "text",
              label: "Имя",
              maxLength: 120,
            },
            {
              type: "row",
              fields: [
                {
                  name: "phone",
                  type: "text",
                  label: "Телефон",
                  maxLength: 40,
                  admin: { width: "50%" },
                },
                {
                  name: "email",
                  type: "email",
                  label: "Email",
                  admin: { width: "50%" },
                },
              ],
            },
            {
              name: "preferredContact",
              type: "select",
              label: "Как удобнее связаться",
              options: [
                { label: "Позвонить", value: "phone" },
                { label: "Telegram", value: "telegram" },
                { label: "WhatsApp", value: "whatsapp" },
                { label: "Email", value: "email" },
              ],
              admin: {
                description: "Необязательно. Заполняется, если пользователь указал.",
              },
            },
            {
              name: "comment",
              type: "textarea",
              label: "Расскажите о задаче",
              maxLength: 4000,
            },
          ],
        },
        {
          label: "Источник",
          fields: [
            {
              name: "source",
              type: "select",
              label: "Источник",
              required: true,
              defaultValue: "other",
              options: [
                { label: "Контакты", value: "contact" },
                { label: "Калькулятор", value: "calculator" },
                { label: "Проект", value: "project" },
                { label: "Услуга", value: "service" },
                { label: "Другое", value: "other" },
              ],
              admin: {
                readOnly: true,
                description: "Устанавливается сайтом автоматически.",
              },
            },
            {
              type: "row",
              fields: [
                {
                  name: "contextType",
                  type: "select",
                  label: "Тип контекста",
                  options: [
                    { label: "Проект", value: "project" },
                    { label: "Услуга", value: "service" },
                  ],
                  admin: { width: "50%", readOnly: true },
                },
                {
                  name: "contextSlug",
                  type: "text",
                  label: "Slug контекста",
                  admin: { width: "50%", readOnly: true },
                },
              ],
            },
          ],
        },
        {
          label: "Расчёт",
          fields: [
            {
              name: "hasCalculatorSnapshot",
              type: "checkbox",
              label: "Есть расчёт",
              defaultValue: false,
              admin: {
                readOnly: true,
                position: "sidebar",
              },
            },
            {
              name: "calculatorSummary",
              type: "textarea",
              label: "Расчёт (кратко)",
              admin: {
                readOnly: true,
                description: "Снимок того, что видел пользователь. Не пересчитывается.",
                rows: 12,
              },
            },
            {
              type: "collapsible",
              label: "Структурированные данные расчёта",
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: "calculatorSnapshot",
                  type: "group",
                  label: "Snapshot",
                  admin: {
                    hideGutter: true,
                  },
                  fields: [
                    {
                      name: "objectType",
                      type: "select",
                      label: "Тип объекта",
                      options: [
                        { label: "Квартира", value: "apartment" },
                        { label: "Дом", value: "house" },
                        { label: "Коммерческое", value: "commercial" },
                      ],
                      admin: { readOnly: true },
                    },
                    {
                      name: "apartmentLayout",
                      type: "select",
                      label: "Планировка",
                      options: [
                        { label: "Студия", value: "studio" },
                        { label: "1-комнатная", value: "1-room" },
                        { label: "2-комнатная", value: "2-room" },
                        { label: "3-комнатная", value: "3-room" },
                        { label: "4+", value: "4-plus" },
                      ],
                      admin: { readOnly: true },
                    },
                    {
                      name: "area",
                      type: "number",
                      label: "Площадь, м²",
                      admin: { readOnly: true },
                    },
                    {
                      name: "renovationType",
                      type: "select",
                      label: "Тип ремонта",
                      options: [
                        { label: "Косметический", value: "cosmetic" },
                        { label: "Капитальный", value: "capital" },
                        { label: "Под ключ", value: "turnkey" },
                      ],
                      admin: { readOnly: true },
                    },
                    {
                      name: "condition",
                      type: "select",
                      label: "Состояние",
                      options: [
                        { label: "Новостройка", value: "new-build" },
                        { label: "Вторичное", value: "secondary" },
                        { label: "Черновая", value: "rough" },
                      ],
                      admin: { readOnly: true },
                    },
                    {
                      name: "workTypes",
                      type: "array",
                      label: "Виды работ",
                      labels: { singular: "Работа", plural: "Работы" },
                      admin: { readOnly: true },
                      fields: [
                        {
                          name: "slug",
                          type: "text",
                          label: "Slug",
                          required: true,
                        },
                        {
                          name: "title",
                          type: "text",
                          label: "Название",
                        },
                      ],
                    },
                    {
                      type: "row",
                      fields: [
                        {
                          name: "estimateMin",
                          type: "number",
                          label: "Оценка от, ₽",
                          admin: { width: "50%", readOnly: true },
                        },
                        {
                          name: "estimateMax",
                          type: "number",
                          label: "Оценка до, ₽",
                          admin: { width: "50%", readOnly: true },
                        },
                      ],
                    },
                    {
                      name: "calculatedAt",
                      type: "date",
                      label: "Время расчёта",
                      admin: {
                        readOnly: true,
                        date: { pickerAppearance: "dayAndTime" },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Служебное",
          fields: [
            {
              name: "status",
              type: "select",
              label: "Статус",
              required: true,
              defaultValue: "new",
              options: [
                { label: "Новая", value: "new" },
                { label: "В работе", value: "in-progress" },
                { label: "Связались", value: "contacted" },
                { label: "Завершена", value: "completed" },
                { label: "Спам", value: "spam" },
              ],
              admin: {
                position: "sidebar",
              },
            },
            {
              name: "consentAccepted",
              type: "checkbox",
              label: "Согласие на обработку ПДн",
              required: true,
              admin: { readOnly: true },
            },
            {
              name: "consentAcceptedAt",
              type: "date",
              label: "Дата согласия",
              admin: {
                readOnly: true,
                date: { pickerAppearance: "dayAndTime" },
              },
            },
            {
              name: "consentVersion",
              type: "text",
              label: "Версия согласия",
              defaultValue: "v1",
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
};
