import type { Badge } from "@/types";

const BADGE_DEFINITIONS: Omit<Badge, "unlocked">[] = [
  {
    id: "streak-3",
    name: "Getting Started",
    nameFr: "Premier pas",
    description: "3 consecutive green days",
    descriptionFr: "3 jours verts consecutifs",
    days: 3,
    icon: "\u{1F331}",
  },
  {
    id: "streak-7",
    name: "One Week Strong",
    nameFr: "Une semaine solide",
    description: "7 consecutive green days",
    descriptionFr: "7 jours verts consecutifs",
    days: 7,
    icon: "\u{1F525}",
  },
  {
    id: "streak-30",
    name: "Monthly Champion",
    nameFr: "Champion du mois",
    description: "30 consecutive green days",
    descriptionFr: "30 jours verts consecutifs",
    days: 30,
    icon: "\u{1F3C6}",
  },
];

/**
 * Retourne les badges avec leur statut unlock base sur le streak actuel
 */
export function getBadges(currentStreak: number): Badge[] {
  return BADGE_DEFINITIONS.map((badge) => ({
    ...badge,
    unlocked: currentStreak >= badge.days,
  }));
}
