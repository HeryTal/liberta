import { PublicationCard } from "@/lib/publication-card";
import type { Publication } from "@/lib/publications";

export function PublicationList({
  publications,
}: {
  publications: Publication[];
}) {
  if (publications.length === 0) {
    return (
      <div className="empty-feed">
        <p className="eyebrow">INDEX / PUBLICATIONS</p>
        <h2>Aucune publication publique pour le moment.</h2>
        <p>Les premiers témoignages apparaîtront ici après validation.</p>
      </div>
    );
  }

  return (
    <div className="feed-grid">
      {publications.map((publication) => (
        <PublicationCard key={publication.id} publication={publication} />
      ))}
    </div>
  );
}
