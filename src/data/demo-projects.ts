/**
 * Temporary demo placeholders for Milestone 02.
 * Not real MBN Stroy projects — replace with CMS data later.
 */
export const demoProjects = [
  {
    id: "demo-apartment-72",
    type: "Квартира",
    city: "Тула",
    area: "72 м²",
    imageLabel: "PROJECT IMAGE",
    imageSize: "1920 × 1200",
  },
  {
    id: "demo-bathroom-8",
    type: "Ванная",
    city: "Тула",
    area: "8 м²",
    imageLabel: "PROJECT IMAGE",
    imageSize: "1920 × 1200",
  },
  {
    id: "demo-apartment-94",
    type: "Квартира",
    city: "Тула",
    area: "94 м²",
    imageLabel: "PROJECT IMAGE",
    imageSize: "1920 × 1200",
  },
] as const;

export type DemoProject = (typeof demoProjects)[number];
