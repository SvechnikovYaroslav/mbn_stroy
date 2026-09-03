import "dotenv/config";

import { filterProjects, matchesProjectFilters } from "../lib/projects/filter";
import {
  getFeaturedProjects,
  getProjectBySlug,
  getProjects,
} from "../lib/projects";
import type { Project } from "../types/project";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const all = await getProjects();
  console.log("published count:", all.length);

  const one = await getProjectBySlug("remont-kvartiry-tula-cms-001");
  assert(one, "CMS test project missing");

  console.log("title:", one.title);
  console.log("effective workTypes:", one.workTypes.join(","));
  console.log(
    "sections:",
    one.sections
      .map(
        (s) =>
          `${s.title}[room=${s.roomType ?? "∅"}; works=${s.workTypes.join("+")}; media=${s.media.length}]`
      )
      .join(" | ")
  );

  assert(one.projectType === "apartment", "expected apartment");
  assert(one.workTypes.includes("plumbing"), "effective plumbing");
  assert(one.workTypes.includes("tiling"), "effective tiling from section");

  const bathroom = one.sections.find((s) => s.roomType === "bathroom");
  assert(bathroom, "bathroom section");
  assert(
    bathroom.workTypes.includes("plumbing") &&
      bathroom.workTypes.includes("tiling") &&
      bathroom.workTypes.includes("electrical"),
    "bathroom section workTypes"
  );
  assert(bathroom.media.length === 1, "bathroom media order/count");

  assert(
    filterProjects({ projectType: "apartment" }, all).some(
      (p) => p.slug === one.slug
    ),
    "filter apartments"
  );
  assert(
    filterProjects({ workType: "plumbing" }, all).some((p) => p.slug === one.slug),
    "filter plumbing"
  );
  assert(
    filterProjects({ sectionType: "bathroom" }, all).some(
      (p) => p.slug === one.slug
    ),
    "filter bathroom"
  );
  assert(
    matchesProjectFilters(one, {
      projectType: "apartment",
      workType: "plumbing",
      sectionType: "bathroom",
    }),
    "combined apartment+plumbing+bathroom"
  );

  const edgeSectionOnly: Project = {
    id: "edge-section-only",
    slug: "edge-section-only",
    title: "Edge section only",
    location: "Тула",
    projectType: "apartment",
    status: "completed",
    workTypes: ["plumbing"],
    cover: one.cover,
    sections: [
      {
        id: "s1",
        title: "Только сантехника",
        workTypes: ["plumbing"],
        media: [],
      },
    ],
  };
  assert(
    matchesProjectFilters(edgeSectionOnly, { workType: "plumbing" }),
    "section-only plumbing"
  );

  const edgeRoomFallback: Project = {
    id: "edge-room-fallback",
    slug: "edge-room-fallback",
    title: "Edge room fallback",
    location: "Тула",
    projectType: "apartment",
    status: "completed",
    workTypes: ["plumbing"],
    cover: one.cover,
    sections: [
      {
        id: "s1",
        title: "Ванная",
        roomType: "bathroom",
        workTypes: [],
        media: [],
      },
    ],
  };
  assert(
    matchesProjectFilters(edgeRoomFallback, {
      workType: "plumbing",
      sectionType: "bathroom",
    }),
    "empty section workTypes fallback"
  );
  assert(
    matchesProjectFilters(edgeRoomFallback, { sectionType: "bathroom" }),
    "bathroom room filter"
  );

  const featured = await getFeaturedProjects(3);
  console.log(
    "featured:",
    featured.map((p) => p.slug).join(",")
  );

  const draft = await getProjectBySlug("kvartira-72");
  assert(!draft, "draft must stay hidden");

  console.log("ALL CHECKS PASSED");
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
