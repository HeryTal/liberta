import type { PublicationType } from "@/lib/publications";

export function publicationTypeLabel(type: PublicationType): string {
  return type === "named_accusation"
    ? "Accusation nominative"
    : "Témoignage public";
}
