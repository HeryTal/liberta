import { formatDate } from "@/lib/format-date";
import type { Publication } from "@/lib/publications";
import { moderatePublication } from "@/app/admin/moderation/actions";

export function AdminPendingList({ publications }: { publications: Publication[] }) {
  if (publications.length === 0) {
    return <div className="empty-feed">Aucune publication en attente.</div>;
  }

  return (
    <div className="admin-pending-list">
      {publications.map((publication) => (
        <article className="admin-pending-card" key={publication.id}>
          <div className="feed-card-meta">
            <span>{publication.type === "named_accusation" ? "ACCUSATION NOMINATIVE" : "TÉMOIGNAGE"}</span>
            <time>{formatDate(publication.createdAt)}</time>
          </div>
          <h2>{publication.title}</h2>
          <p className="admin-content">{publication.content}</p>
          <p className="admin-author">{publication.isAnonymous ? "ANONYME" : publication.pseudonym}</p>
          <div className="admin-actions">
            <form action={moderatePublication}>
              <input type="hidden" name="id" value={publication.id} />
              <input type="hidden" name="status" value="published" />
              <button type="submit">PUBLIER ↗</button>
            </form>
            <form action={moderatePublication}>
              <input type="hidden" name="id" value={publication.id} />
              <input type="hidden" name="status" value="removed" />
              <button type="submit">RETIRER</button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
