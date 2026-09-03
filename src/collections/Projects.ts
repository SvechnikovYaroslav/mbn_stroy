import type { CollectionConfig, FieldHook } from "payload";

import { authenticated } from "@/access";
import { toSlug } from "@/lib/slugify";
import {
  projectTypeLabels,
  renovationTypeLabels,
  sectionTypeLabels,
} from "@/config/project";

const projectTypeOptions = (
  Object.entries(projectTypeLabels) as [string, string][]
).map(([value, label]) => ({ value, label }));

const renovationTypeOptions = (
  Object.entries(renovationTypeLabels) as [string, string][]
).map(([value, label]) => ({ value, label }));

const roomTypeOptions = (
  Object.entries(sectionTypeLabels) as [string, string][]
).map(([value, label]) => ({ value, label }));

const ensureUniqueProjectSlug: FieldHook = async ({
  value,
  data,
  req,
  originalDoc,
}) => {
  const title = data?.title ?? originalDoc?.title;
  const base =
    toSlug(String(value || title || "project")) || "project";

  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await req.payload.find({
      collection: "projects",
      where: {
        and: [
          { slug: { equals: candidate } },
          ...(originalDoc?.id
            ? [{ id: { not_equals: originalDoc.id } }]
            : []),
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });

    if (!existing.docs.length) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
};

/**
 * Projects admin is the primary content workflow:
 * create project → object work types → sections → inline media → Publish.
 */
export const Projects: CollectionConfig = {
  slug: "projects",
  labels: {
    singular: "Проект",
    plural: "Проекты",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "projectType", "location", "_status", "updatedAt"],
    description:
      "Создайте проект, укажите виды работ, добавьте разделы и загрузите фото/видео прямо в форму — затем Publish.",
  },
  versions: {
    drafts: true,
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req: { user } }) => {
      if (user) return true;
      return {
        _status: {
          equals: "published",
        },
      };
    },
    update: authenticated,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Основное",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Название",
              required: true,
            },
            {
              name: "location",
              type: "text",
              label: "Расположение",
              required: true,
            },
            {
              name: "area",
              type: "number",
              label: "Площадь",
              admin: {
                description: "м²",
              },
            },
            {
              name: "projectType",
              type: "select",
              label: "Тип объекта",
              required: true,
              options: projectTypeOptions,
            },
            {
              name: "renovationType",
              type: "select",
              label: "Тип ремонта",
              options: renovationTypeOptions,
            },
            {
              type: "row",
              fields: [
                {
                  name: "durationValue",
                  type: "number",
                  label: "Срок",
                  min: 1,
                  admin: {
                    width: "50%",
                    description: "Число",
                  },
                },
                {
                  name: "durationUnit",
                  type: "select",
                  label: "Единица срока",
                  options: [
                    { label: "День", value: "day" },
                    { label: "Месяц", value: "month" },
                    { label: "Год", value: "year" },
                  ],
                  admin: {
                    width: "50%",
                    description: "День / месяц / год",
                  },
                },
              ],
            },
            {
              name: "year",
              type: "number",
              label: "Год завершения",
            },
            {
              name: "description",
              type: "textarea",
              label: "Описание",
            },
            {
              name: "cover",
              type: "upload",
              label: "Обложка",
              relationTo: "media",
              admin: {
                allowCreate: true,
                description:
                  "Перетащите или выберите файл. Alt и подпись заполнять не обязательно.",
              },
            },
          ],
        },
        {
          label: "Виды работ",
          description:
            "Все работы на объекте целиком. В разделах ниже можно уточнить, какие работы показаны в конкретной галерее.",
          fields: [
            {
              name: "workTypes",
              type: "relationship",
              label: "Виды работ объекта",
              relationTo: "work-types",
              hasMany: true,
              admin: {
                allowCreate: false,
                description:
                  "Например: отделка, электрика, сантехника, натяжные потолки.",
              },
            },
          ],
        },
        {
          label: "Разделы и медиа",
          description:
            "Раздел = помещение (ванная) или вид работ (натяжные потолки). Медиа загружайте inline в нужном порядке.",
          fields: [
            {
              name: "sections",
              type: "array",
              label: "Разделы",
              labels: {
                singular: "Раздел",
                plural: "Разделы",
              },
              admin: {
                initCollapsed: true,
                description:
                  "Порядок разделов = порядок на странице проекта. Перетаскивайте для сортировки.",
              },
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Название",
                  required: true,
                  admin: {
                    description:
                      "Например: «Ванная» или «Натяжные потолки».",
                  },
                },
                {
                  name: "roomType",
                  type: "select",
                  label: "Помещение",
                  options: roomTypeOptions,
                  admin: {
                    description:
                      "Необязательно. Для разделов по виду работ (например натяжные потолки) оставьте пустым.",
                  },
                },
                {
                  name: "workTypes",
                  type: "relationship",
                  label: "Виды работ в разделе",
                  relationTo: "work-types",
                  hasMany: true,
                  admin: {
                    allowCreate: false,
                    description:
                      "Какие работы показаны в этом разделе (связка медиа ↔ вид работ).",
                  },
                },
                {
                  name: "description",
                  type: "textarea",
                  label: "Описание",
                },
                {
                  name: "mediaItems",
                  type: "array",
                  label: "Медиа",
                  labels: {
                    singular: "Файл",
                    plural: "Файлы",
                  },
                  admin: {
                    description:
                      "Достаточно выбрать или перетащить файлы. Порядок сохраняется.",
                  },
                  fields: [
                    {
                      name: "media",
                      type: "upload",
                      label: "Файл",
                      relationTo: "media",
                      required: true,
                      admin: {
                        allowCreate: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "featured",
      type: "checkbox",
      label: "Показывать на главной",
      defaultValue: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      type: "collapsible",
      label: "Дополнительно",
      admin: {
        position: "sidebar",
        initCollapsed: true,
      },
      fields: [
        {
          name: "slug",
          type: "text",
          label: "URL (slug)",
          required: true,
          unique: true,
          index: true,
          admin: {
            description:
              "Генерируется из названия автоматически. Меняйте только при необходимости.",
          },
          hooks: {
            beforeValidate: [ensureUniqueProjectSlug],
          },
        },
        {
          name: "sortOrder",
          type: "number",
          label: "Порядок сортировки",
          admin: {
            description:
              "Необязательно. Если не задан — на сайте сортировка по дате публикации.",
          },
        },
      ],
    },
  ],
};
