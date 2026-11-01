import type { CollectionConfig } from "payload";

import { authenticated } from "@/access";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SOURCE_LABELS: Record<string, string> = {
  contact: "Форма контактов",
  calculator: "Калькулятор",
  project: "Страница проекта",
  service: "Страница услуги",
  other: "Другое",
};

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
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Notify on new leads only — edits never re-notify.
        if (operation !== "create") return doc;
        const notifyTo = process.env.NOTIFY_EMAIL?.trim();
        if (!notifyTo || !req.payload.email?.sendEmail) {
          req.payload.logger.warn(
            `Lead ${doc.id}: email notification skipped (SMTP not configured)`
          );
          return doc;
        }
        const snap = doc.calculatorSnapshot;
        const adminUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/admin/collections/leads/${doc.id}`;
        const rows: [string, string][] = [
          ["Имя", doc.name],
          ["Телефон", doc.phone],
          ["Email", doc.email],
          ["Связаться", doc.preferredContact],
          ["Источник", SOURCE_LABELS[doc.source] || doc.source],
          ["Контекст", doc.contextSlug],
          ["Площадь", snap?.area && `${snap.area} м²`],
          ["Тип ремонта", snap?.renovationType],
          ["Оценка", snap?.estimateMin && `от ${snap.estimateMin} до ${snap.estimateMax} ₽`],
          ["Работы", snap?.workTypes?.map((w: { title?: string }) => w.title).filter(Boolean).join(", ")],
          ["Комментарий", doc.comment],
          ["Дата", doc.createdAt],
        ].filter((r): r is [string, string] => Boolean(r[1]));
        const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\n${adminUrl}`;
        const html =
          `<h2>Новая заявка №${doc.id}</h2><table cellpadding="6" style="border-collapse:collapse">` +
          rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(String(v))}</td></tr>`).join("") +
          `</table><p><a href="${adminUrl}">Открыть в админке</a></p>`;
        try {
          await req.payload.email.sendEmail({
            to: notifyTo,
            subject: `Отделка 360 — новая заявка №${doc.id}`,
            text,
            html,
          });
          req.payload.logger.info(`Lead ${doc.id}: notification sent`);
        } catch (err) {
          // Never fail the request — the lead is already persisted.
          req.payload.logger.error(
            `Lead ${doc.id}: notification failed: ${err instanceof Error ? err.message : err}`
          );
        }
        return doc;
      },
    ],
  },
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
                { label: "Договор заключён", value: "contract" },
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
              admin: { readOnly: true },
            },
            {
              name: "privacyPolicyVersion",
              type: "text",
              label: "Версия политики ПДн",
              admin: { readOnly: true },
            },
            {
              name: "consentSource",
              type: "text",
              label: "Источник согласия",
              admin: { readOnly: true },
            },
            {
              name: "lastActivityAt",
              type: "date",
              label: "Последнее взаимодействие",
              admin: { date: { pickerAppearance: "dayAndTime" } },
            },
            {
              name: "expiresAt",
              type: "date",
              label: "Удалить после",
              admin: { readOnly: true, description: "Обычная заявка хранится до года с последнего взаимодействия." },
            },
            {
              name: "contractConcluded",
              type: "checkbox",
              label: "По заявке заключён договор",
              defaultValue: false,
              admin: { description: "Не удаляйте такие данные автоматически: к ним применяются сроки хранения документов по закону." },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
};
