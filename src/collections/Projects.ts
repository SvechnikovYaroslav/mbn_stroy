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

const sectionTypeOptions = (
  Object.entries(sectionTypeLabels) as [string, string][]
).map(([value, label]) => ({ value, label }));

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: {
    singular: "Проект",
    plural: "Проекты",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "projectType", "location", "_status", "updatedAt"],
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
      name: "title",
      type: "text",
      label: "Название",
      required: true,
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
      name: "workTypes",
      type: "relationship",
      label: "Виды работ",
      relationTo: "work-types",
      hasMany: true,
    },
    {
      name: "duration",
      type: "text",
      label: "Срок",
    },
    {
      name: "year",
      type: "number",
      label: "Год",
    },
    {
      name: "description",
      type: "textarea",
      label: "Описание",
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
    {
      name: "cover",
      type: "upload",
      label: "Обложка",
      relationTo: "media",
    },
    {
      name: "sections",
      type: "array",
      label: "Помещения",
      labels: {
        singular: "Помещение",
        plural: "Помещения",
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: "title",
          type: "text",
          label: "Название",
          required: true,
        },
        {
          name: "type",
          type: "select",
          label: "Тип помещения",
          required: true,
          options: sectionTypeOptions,
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
            singular: "Медиафайл",
            plural: "Медиа",
          },
          admin: {
            description:
              "Фото и видео в одном списке. Порядок сохраняется при перетаскивании.",
          },
          fields: [
            {
              name: "media",
              type: "upload",
              label: "Файл",
              relationTo: "media",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
