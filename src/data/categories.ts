import { Category } from "@/types";

export const categories: Category[] = [
  { id: "cat-env", slug: "environment-conservation", name: "Environment & Conservation", description: "Protection of Lake Victoria ecosystem, wetlands, biodiversity and climate resilience.", enabled: true, order: 1 },
  { id: "cat-blue", slug: "blue-economy", name: "Blue Economy", description: "Sustainable fisheries, aquaculture, water transport, trade and livelihoods.", enabled: true, order: 2 },
  { id: "cat-dev", slug: "community-development", name: "Community Development", description: "Education, health, water, energy, infrastructure and inclusive growth.", enabled: true, order: 3 },
  { id: "cat-hr", slug: "human-rights", name: "Human Rights", description: "Accountability, access to justice, gender equality and civic participation.", enabled: true, order: 4 },
];
