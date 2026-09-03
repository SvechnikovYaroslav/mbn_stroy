import type { CollectionConfig } from "payload";

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

/**
 * Projects admin is the primary content workflow:
 * create project → object work types → sections → inline media → Publish.
 * Media collection remains a technical library; uploads happen here.
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
              type: "row",
              fields: [
                {
                  name: "location",
                  type: "text",
                  label: "Расположение",
                  required: true,
                  admin: { width: "50%" },
                },
                {
                  name: "area",
                  type: "number",
                  label: "Площадь",
                  admin: {
                    width: "50%",
                    description: "м²",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "projectType",
                  type: "select",
                  label: "Тип объекта",
                  required: true,
                  options: projectTypeOptions,
                  admin: { width: "50%" },
                },
                {
                  name: "renovationType",
                  type: "select",
                  label: "Тип ремонта",
                  options: renovationTypeOptions,
                  admin: { width: "50%" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "duration",
                  type: "text",
                  label: "Срок",
                  admin: { width: "50%" },
                },
                {
                  name: "year",
                  type: "number",
                  label: "Год",
                  admin: { width: "50%" },
                },
              ],
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
                description: "Загрузите обложку прямо здесь — без перехода в Медиа.",
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
                      "Фото и видео в одном списке. Порядок сохраняется. Загружайте файлы здесь.",
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
      name: "slug",
      type: "text",
      label: "URL",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return toSlug(String(value));
            if (data?.title) return toSlug(String(data.title));
            return value;
          },
        ],
      },
    },
    {
      name: "featured",
      type: "checkbox",
      label: "Избранный",
      defaultValue: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Порядок",
      defaultValue: 0,
      admin: {
        position: "sidebar",
      },
    },
  ],
};
