import type { CollectionConfig } from "payload";

import { authenticated } from "@/access";
import { toSlug } from "@/lib/slugify";

export const WorkTypes: CollectionConfig = {
  slug: "work-types",
  labels: {
    singular: "Вид работ",
    plural: "Виды работ",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "active", "sortOrder"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req: { user } }) => {
      if (user) return true;
      return {
        active: {
          equals: true,
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
      name: "description",
      type: "textarea",
      label: "Описание",
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
      name: "active",
      type: "checkbox",
      label: "Активен",
      defaultValue: true,
      admin: {
        position: "sidebar",
      },
    },
  ],
};
