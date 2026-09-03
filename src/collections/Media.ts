import type { CollectionConfig } from "payload";

import { anyone, authenticated } from "@/access";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Медиафайл",
    plural: "Медиа",
  },
  admin: {
    group: "Система",
    description:
      "Техническая медиатека. Основной workflow — загрузка файлов прямо из формы Проекта (обложка и разделы).",
    defaultColumns: ["filename", "alt", "mimeType", "updatedAt"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "video/mp4", "video/webm"],
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
        withoutEnlargement: true,
      },
      {
        name: "card",
        width: 800,
        height: 500,
        position: "centre",
        withoutEnlargement: true,
      },
      {
        name: "large",
        width: 1920,
        height: undefined,
        withoutEnlargement: true,
      },
    ],
    adminThumbnail: "thumbnail",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alt-текст",
    },
    {
      name: "caption",
      type: "text",
      label: "Подпись",
    },
    {
      name: "orientation",
      type: "select",
      label: "Ориентация",
      options: [
        { label: "Альбомная", value: "landscape" },
        { label: "Портретная", value: "portrait" },
        { label: "Квадрат", value: "square" },
      ],
      admin: {
        description: "Необязательно. Полезно для вертикальных видео и фото.",
      },
    },
  ],
};
