import Link from "next/link";
import { formatDate } from "@/lib/format-date";
import { publicationTypeLabel } from "@/lib/publication-labels";
import type { Publication } from "@/lib/publications";

export function PublicationCard({ publication }: { publication: Publication }) {
  return (
    <article className="feed-card">
      <div className="feed-card-meta">
        <span>{publicationTypeLabel(publication.type)}</span>
        <time dateTime={publication.createdAt.toISOString()}>
          {formatDate(publication.publishedAt ?? publication.createdAt)}
        </time>
      </div>
      <h2>{publication.title}</h2>
      <p className="feed-card-excerpt">
        {publication.content.length > 220
          ? `${publication.content.slice(0, 220).trim()}…`
          : publication.content}
      </p>
      <div className="feed-card-footer">
        <span>{publication.isAnonymous ? "Anonyme" : publication.pseudonym}</span>
        <Link href={`/publications/${publication.id}`}>Lire →</Link>
      </div>
    </article>
  );
}
