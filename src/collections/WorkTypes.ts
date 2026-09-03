import type { CollectionConfig, FieldHook } from "payload";

import { authenticated } from "@/access";
import { toSlug } from "@/lib/slugify";

const ensureSlug: FieldHook = ({ value, data, operation, originalDoc }) => {
  if (value) return toSlug(String(value));

  // Never rewrite an existing slug used by Projects / Calculator.
  if (originalDoc?.slug) return originalDoc.slug;

  if (operation === "create" && data?.title) {
    return toSlug(String(data.title));
  }

  if (data?.title) return toSlug(String(data.title));
  return value;
};

/**
 * Work Types are the shared taxonomy for:
 * projects, sections, calculator extras, and public /services pages.
 */
export const WorkTypes: CollectionConfig = {
  slug: "work-types",
  labels: {
    singular: "Вид работ",
    plural: "Виды работ",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "active",
      "showOnServicesPage",
      "featured",
      "updatedAt",
    ],
    description:
      "Виды работ для проектов, калькулятора и публичных страниц услуг.",
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
      name: "shortDescription",
      type: "textarea",
      label: "Короткое описание",
      admin: {
        description: "Для карточки на /services. Без маркетинговых обещаний.",
      },
    },
    {
      name: "description",
      type: "richText",
      label: "Описание",
      admin: {
        description: "Полное описание на странице услуги.",
      },
    },
    {
      name: "cover",
      type: "upload",
      label: "Обложка",
      relationTo: "media",
      admin: {
        allowCreate: true,
        description: "Необязательно. Можно загрузить прямо здесь.",
      },
    },
    {
      name: "showOnServicesPage",
      type: "checkbox",
      label: "Показывать в разделе «Услуги»",
      defaultValue: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      label: "Показывать среди основных услуг",
      defaultValue: false,
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
        description: "Выключенные виды не показываются публично.",
      },
    },
    {
      type: "collapsible",
      label: "Дополнительно",
      admin: {
        initCollapsed: true,
        position: "sidebar",
      },
      fields: [
        {
          name: "slug",
          type: "text",
          label: "URL",
          required: true,
          unique: true,
          index: true,
          admin: {
            description:
              "Для новых записей генерируется из названия. Существующие slug не меняйте без необходимости.",
          },
          hooks: {
            beforeValidate: [ensureSlug],
          },
        },
        {
          name: "sortOrder",
          type: "number",
          label: "Порядок",
          defaultValue: 0,
          admin: {
            description: "Меньше — выше в списке.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "SEO",
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: "seoTitle",
          type: "text",
          label: "SEO заголовок",
          admin: {
            description: "Если пусто: «{Название} в Туле — MBN Строй».",
          },
        },
        {
          name: "seoDescription",
          type: "textarea",
          label: "SEO описание",
          admin: {
            description: "Если пусто — из короткого описания или нейтральный текст.",
          },
        },
      ],
    },
  ],
};
