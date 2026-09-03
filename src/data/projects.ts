import type { Project } from "@/types/project";

/**
 * Local demo portfolio data for Milestone 03.
 * First projects use real company photos from public/media/projects.
 * Remaining entries are explicit placeholders — not real MBN Stroy objects.
 */
export const projects: Project[] = [
  {
    id: "project-001",
    slug: "remont-kvartiry-tula-001",
    title: "Ремонт квартиры",
    location: "Тула",
    projectType: "apartment",
    status: "completed",
    description:
      "Ремонт квартиры в Туле. Фотографии реальных работ компании. Детали площади и сроков будут уточнены позже.",
    cover: {
      id: "project-001-cover",
      type: "image",
      src: "/media/projects/project-001/cover.jpg",
      alt: "Гостиная после ремонта",
      orientation: "landscape",
    },
    sections: [
      {
        id: "project-001-bathroom",
        type: "bathroom",
        title: "Ванная комната",
        media: [
          {
            id: "project-001-bathroom-01",
            type: "image",
            src: "/media/projects/project-001/bathroom/01.jpg",
            alt: "Ванная после ремонта",
            orientation: "portrait",
          },
        ],
      },
      {
        id: "project-001-living-room",
        type: "living-room",
        title: "Гостиная",
        media: [
          {
            id: "project-001-living-room-01",
            type: "image",
            src: "/media/projects/project-001/living-room/01.jpg",
            alt: "Гостиная после ремонта",
            orientation: "landscape",
          },
        ],
      },
      {
        id: "project-001-bedroom",
        type: "bedroom",
        title: "Спальня",
        media: [
          {
            id: "project-001-bedroom-01",
            type: "image",
            src: "/media/projects/project-001/bedroom/01.jpg",
            alt: "Спальня после ремонта",
            orientation: "landscape",
          },
        ],
      },
      {
        id: "project-001-hallway",
        type: "hallway",
        title: "Прихожая",
        media: [
          {
            id: "project-001-hallway-01",
            type: "image",
            src: "/media/projects/project-001/hallway/01.jpg",
            alt: "Инженерные работы в прихожей",
            orientation: "landscape",
          },
        ],
      },
    ],
  },
  {
    id: "project-002",
    slug: "remont-kvartiry-tula-002",
    title: "Ремонт квартиры",
    location: "Тула",
    projectType: "apartment",
    status: "completed",
    description:
      "Подборка реальных фотографий интерьера после ремонта. Типы отдельных зон не размечены — будут уточнены при переносе в CMS.",
    cover: {
      id: "project-002-cover",
      type: "image",
      src: "/media/projects/project-002/cover.jpg",
      alt: "Интерьер после ремонта",
      orientation: "landscape",
    },
    sections: [
      {
        id: "project-002-interior",
        type: "interior",
        title: "Интерьер",
        description: "Фотографии объекта без привязки к отдельным зонам.",
        media: [
          {
            id: "project-002-interior-01",
            type: "image",
            src: "/media/projects/project-002/interior/01.jpg",
            alt: "Интерьер после ремонта",
          },
          {
            id: "project-002-interior-02",
            type: "image",
            src: "/media/projects/project-002/interior/02.jpg",
            alt: "Интерьер после ремонта",
          },
          {
            id: "project-002-interior-03",
            type: "image",
            src: "/media/projects/project-002/interior/03.jpg",
            alt: "Интерьер после ремонта",
          },
          {
            id: "project-002-interior-04",
            type: "image",
            src: "/media/projects/project-002/interior/04.jpg",
            alt: "Интерьер после ремонта",
          },
          {
            id: "project-002-interior-05",
            type: "image",
            src: "/media/projects/project-002/interior/05.jpg",
            alt: "Интерьер после ремонта",
          },
          {
            id: "project-002-interior-06",
            type: "image",
            src: "/media/projects/project-002/interior/06.jpg",
            alt: "Интерьер после ремонта",
          },
        ],
      },
    ],
  },
  {
    id: "project-003",
    slug: "kvartira-72",
    title: "Квартира 72 м²",
    location: "Тула",
    area: 72,
    projectType: "apartment",
    renovationType: "turnkey",
    status: "completed",
    isPlaceholder: true,
    description:
      "Демонстрационный объект. Реальные фотографии будут добавлены позже.",
    cover: {
      id: "project-003-cover",
      type: "image",
      src: "",
      alt: "Placeholder обложки",
    },
    sections: [
      {
        id: "project-003-bathroom",
        type: "bathroom",
        title: "Ванная",
        media: [],
      },
      {
        id: "project-003-kitchen",
        type: "kitchen",
        title: "Кухня",
        media: [],
      },
      {
        id: "project-003-balcony",
        type: "balcony",
        title: "Балкон",
        media: [],
      },
    ],
  },
  {
    id: "project-004",
    slug: "kvartira-54",
    title: "Квартира 54 м²",
    location: "Тула",
    area: 54,
    projectType: "apartment",
    status: "completed",
    isPlaceholder: true,
    cover: {
      id: "project-004-cover",
      type: "image",
      src: "",
      alt: "Placeholder обложки",
    },
    sections: [
      {
        id: "project-004-bathroom",
        type: "bathroom",
        title: "Ванная",
        media: [],
      },
      {
        id: "project-004-kitchen",
        type: "kitchen",
        title: "Кухня",
        media: [],
      },
    ],
  },
  {
    id: "project-005",
    slug: "kvartira-91",
    title: "Квартира 91 м²",
    location: "Тульская область",
    area: 91,
    projectType: "apartment",
    renovationType: "capital",
    status: "completed",
    isPlaceholder: true,
    cover: {
      id: "project-005-cover",
      type: "image",
      src: "",
      alt: "Placeholder обложки",
    },
    sections: [
      {
        id: "project-005-living-room",
        type: "living-room",
        title: "Гостиная",
        media: [],
      },
      {
        id: "project-005-bedroom",
        type: "bedroom",
        title: "Спальня",
        media: [],
      },
      {
        id: "project-005-balcony",
        type: "balcony",
        title: "Балкон",
        media: [],
      },
    ],
  },
  {
    id: "project-006",
    slug: "dom-140",
    title: "Дом 140 м²",
    location: "Тульская область",
    area: 140,
    projectType: "house",
    renovationType: "turnkey",
    status: "completed",
    isPlaceholder: true,
    cover: {
      id: "project-006-cover",
      type: "image",
      src: "",
      alt: "Placeholder обложки",
    },
    sections: [
      {
        id: "project-006-kitchen",
        type: "kitchen",
        title: "Кухня",
        media: [],
      },
      {
        id: "project-006-bathroom",
        type: "bathroom",
        title: "Ванная",
        media: [],
      },
      {
        id: "project-006-living-room",
        type: "living-room",
        title: "Гостиная",
        media: [],
      },
    ],
  },
  {
    id: "project-007",
    slug: "vannaya-8",
    title: "Ванная 8 м²",
    location: "Тула",
    area: 8,
    projectType: "room",
    status: "completed",
    isPlaceholder: true,
    cover: {
      id: "project-007-cover",
      type: "image",
      src: "",
      alt: "Placeholder обложки",
    },
    sections: [
      {
        id: "project-007-bathroom",
        type: "bathroom",
        title: "Ванная комната",
        media: [],
      },
    ],
  },
  {
    id: "project-008",
    slug: "kvartira-68",
    title: "Квартира 68 м²",
    location: "Тула",
    area: 68,
    projectType: "apartment",
    status: "completed",
    isPlaceholder: true,
    cover: {
      id: "project-008-cover",
      type: "image",
      src: "",
      alt: "Placeholder обложки",
    },
    sections: [
      {
        id: "project-008-kitchen",
        type: "kitchen",
        title: "Кухня",
        media: [],
      },
      {
        id: "project-008-balcony",
        type: "balcony",
        title: "Балкон",
        media: [],
      },
      {
        id: "project-008-bedroom",
        type: "bedroom",
        title: "Спальня",
        media: [],
      },
    ],
  },
];
