import "dotenv/config";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { getPayload } from "payload";

import config from "../payload.config";

async function main() {
  const filePath = path.resolve(
    "public/media/projects/project-001/bathroom/01.jpg"
  );

  if (!existsSync(filePath)) {
    throw new Error(`Test image not found: ${filePath}`);
  }

  const data = readFileSync(filePath);
  const payload = await getPayload({ config });

  const media = await payload.create({
    collection: "media",
    data: {
      alt: "Тестовое фото ванной",
      caption: "Проверка upload image",
      orientation: "portrait",
    },
    file: {
      data,
      mimetype: "image/jpeg",
      name: "bathroom-test.jpg",
      size: statSync(filePath).size,
    },
  });

  console.log("Uploaded media id:", media.id);
  console.log("mimeType:", media.mimeType);
  console.log("url:", media.url);
  console.log("sizes:", media.sizes ? Object.keys(media.sizes) : []);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
