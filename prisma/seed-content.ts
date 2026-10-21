import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type ArticleStatus, type MediaType } from "../src/generated/prisma/client";
import { preferIpv4ForDatabaseHost } from "../src/backend/database/db-host";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

preferIpv4ForDatabaseHost(new URL(connectionString).hostname);

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const categories = [
  { slug: "environment", name: "Environment", description: "Wetlands, water quality, biodiversity and climate.", order: 1 },
  { slug: "fisheries", name: "Fisheries", description: "Fishing communities, lake resources and livelihoods.", order: 2 },
  { slug: "governance", name: "Governance", description: "Policy, county decisions and public participation.", order: 3 },
  { slug: "health", name: "Health", description: "Community health, sanitation and disease monitoring.", order: 4 },
  { slug: "culture", name: "Culture", description: "Heritage, language and community life.", order: 5 },
];

type SeedArticle = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  categorySlug: string;
  location: string;
  status: ArticleStatus;
  tags: string[];
  publishedAt: Date;
};

const articles: SeedArticle[] = [
  {
    slug: "wetland-restoration-efforts-lake-victoria",
    title: "Wetland restoration efforts gather pace around Lake Victoria",
    summary: "Communities along the lake shore are restoring degraded wetland sections, improving water quality and protecting fish nurseries.",
    content:
      "Restoration groups across the shoreline are working on sections of wetland that were drained over the last few decades. Early results show returning plant cover and calmer water in the shallow bays. County authorities say the work complements the broader catchment programme, and local groups are recording fish returns in areas that had seen a steady decline.",
    categorySlug: "environment",
    location: "Kisumu County",
    status: "PUBLISHED" as ArticleStatus,
    tags: ["wetlands", "restoration", "water quality"],
    publishedAt: new Date("2026-01-18T09:00:00Z"),
  },
  {
    slug: "fishing-nets-and-lake-safety",
    title: "Fisher groups push for safer nets and clearer lake rules",
    summary: "Boat groups are calling for a review of net size rules and better coordination with beach management committees.",
    content:
      "Fishing groups met with county officials to discuss net size limits, safe boating around landing sites and how catch records are shared. Several members asked for equipment marking so that abandoned nets can be traced. The committee agreed to draft a consolidated set of beach rules for the next season.",
    categorySlug: "fisheries",
    location: "Homa Bay County",
    status: "PUBLISHED" as ArticleStatus,
    tags: ["fisheries", "governance", "safety"],
    publishedAt: new Date("2026-01-11T09:00:00Z"),
  },
  {
    slug: "water-hyacinth-clearing-effort",
    title: "Water hyacinth clearing effort expands to new landing sites",
    summary: "Volunteer crews are clearing dense mats of water hyacinth that narrow channels and slow small boats.",
    content:
      "Clearing crews have extended their work to additional landing sites where thick growth had narrowed the approach channels. Volunteers say the effort is most visible in the weeks after the rains. Officials are weighing mechanical removal contracts against continued manual work.",
    categorySlug: "environment",
    location: "Kisumu County",
    status: "PUBLISHED" as ArticleStatus,
    tags: ["water hyacinth", "volunteers"],
    publishedAt: new Date("2025-12-19T09:00:00Z"),
  },
  {
    slug: "county-budget-listening-session",
    title: "County holds budget listening session on lake funding",
    summary: "Residents asked for clearer reporting on funds allocated to lake-facing infrastructure and drainage.",
    content:
      "The county convened a public session to hear concerns about funding for drainage, waste collection and shoreline access. Participants asked for a simpler reporting structure and a published schedule for disbursement. The finance team committed to publishing a summary after the session.",
    categorySlug: "governance",
    location: "Kisumu County",
    status: "PUBLISHED" as ArticleStatus,
    tags: ["budget", "public participation"],
    publishedAt: new Date("2025-12-05T09:00:00Z"),
  },
  {
    slug: "community-health-records",
    title: "Community health records move to a shared register",
    summary: "Health posts in three sub-counties will use a common register to cut duplicate visits and speed referrals.",
    content:
      "Health posts are moving to a shared register that records visits, referrals and stock levels in one place. Staff say the change should reduce duplicate registrations during outreach days. Training for the new register is under way before the next reporting cycle.",
    categorySlug: "health",
    location: "Kisumu County",
    status: "PUBLISHED" as ArticleStatus,
    tags: ["health", "records"],
    publishedAt: new Date("2025-11-27T09:00:00Z"),
  },
];

type SeedMedia = {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  duration?: string;
  categorySlug?: string;
  publishedAt: Date;
};

const media: SeedMedia[] = [
  {
    id: "radio-lake-village-hour",
    type: "RADIO" as MediaType,
    title: "Lake Village Hour",
    description:
      "Weekly radio programme with interviews from landing sites, farmers and county officers across the basin.",
    duration: "58 min",
    categorySlug: "culture",
    publishedAt: new Date("2026-01-15T06:00:00Z"),
  },
  {
    id: "podcast-wetland-stories",
    type: "PODCAST" as MediaType,
    title: "Wetland Stories",
    description:
      "Recorded conversations with community groups restoring degraded shoreline sections.",
    duration: "24 min",
    categorySlug: "environment",
    publishedAt: new Date("2026-01-09T06:00:00Z"),
  },
  {
    id: "video-fishing-gear-marking",
    type: "VIDEO" as MediaType,
    title: "Marking fishing gear",
    description:
      "Short explainer on how marked nets help beach management committees trace lost gear.",
    duration: "6 min",
    categorySlug: "fisheries",
    publishedAt: new Date("2026-01-04T06:00:00Z"),
  },
  {
    id: "newspaper-basin-community-brief",
    type: "NEWSPAPER" as MediaType,
    title: "Basin Community Brief",
    description:
      "Printed community newspaper carrying meeting notices, public participation calls and job adverts.",
    duration: "12 pages",
    categorySlug: "governance",
    publishedAt: new Date("2025-12-28T06:00:00Z"),
  },
  {
    id: "radio-health-outreach",
    type: "RADIO" as MediaType,
    title: "Health Outreach Live",
    description:
      "Live phone-in on the shared community health register now used across three sub-counties.",
    duration: "45 min",
    categorySlug: "health",
    publishedAt: new Date("2025-12-20T06:00:00Z"),
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  console.log(`Seeded ${categories.length} categories`);

  const stored = await prisma.category.findMany();
  const bySlug = new Map(stored.map((category) => [category.slug, category]));

  for (const article of articles) {
    const { categorySlug, ...rest } = article;
    const category = bySlug.get(categorySlug);
    if (!category) continue;

    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        ...rest,
        categoryId: category.id,
        publishedAt: article.publishedAt,
      },
      create: {
        ...rest,
        categoryId: category.id,
        publishedAt: article.publishedAt,
      },
    });
  }
  console.log(`Seeded ${articles.length} articles`);

  for (const item of media) {
    const { categorySlug, ...rest } = item;
    const category = categorySlug ? bySlug.get(categorySlug) : undefined;

    await prisma.mediaItem.upsert({
      where: { id: item.id },
      update: {
        ...rest,
        categoryId: category?.id ?? null,
        publishedAt: item.publishedAt,
      },
      create: {
        ...rest,
        categoryId: category?.id ?? null,
        publishedAt: item.publishedAt,
      },
    });
  }
  console.log(`Seeded ${media.length} media items`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
