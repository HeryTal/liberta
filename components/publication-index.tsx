import Link from "next/link";
import { formatDate } from "@/lib/format-date";
import { publicationTypeLabel } from "@/lib/publication-labels";
import { getPublishedPublications } from "@/lib/publications";
import { getLocale } from "@/lib/locale";
import { translations } from "@/lib/translations";

export async function PublicationIndex() {
  const t = translations[await getLocale()];
  const { publications } = await getPublishedPublications({ pageSize: 6 });

  return (
    <section className="archive-layout" id="publications">
      <div className="archive-heading">
        <span>{t.index}</span>
        <span>{publications.length.toString().padStart(2, "0")} ÉLÉMENTS</span>
      </div>
      <div className="publication-list">
        {publications.map((publication) => (
          <article className="publication-row" key={publication.id}>
            <div className="publication-id">
              {publication.type === "named_accusation" ? "A" : "T"}-
              {publication.id.slice(-4).toUpperCase()}
            </div>
            <div className="publication-title">
              <h2>
                <Link href={`/publications/${publication.id}`}>
                  {publication.title}
                </Link>
              </h2>
              <p>{publication.content.slice(0, 180)}</p>
            </div>
            <div className="publication-year">
              {formatDate(publication.publishedAt ?? publication.createdAt)}
            </div>
            <div className="publication-type">
              {publicationTypeLabel(publication.type)}
            </div>
            <div className="publication-status">{t.published}</div>
          </article>
        ))}
        {publications.length === 0 ? (
          <div className="empty-feed">
            <p>{t.noPublications}</p>
          </div>
        ) : null}
      </div>
      <Link className="archive-more-link" href="/publications">
        {t.seeAll}
      </Link>
    </section>
  );
}
