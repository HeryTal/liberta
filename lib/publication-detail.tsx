import Link from "next/link";
import { formatDate } from "@/lib/format-date";
import { publicationTypeLabel } from "@/lib/publication-labels";
import type { Publication } from "@/lib/publications";
import { ReportForm } from "@/lib/report-form";
import type { Locale } from "@/lib/translations";

export function PublicationDetail({
  publication,
  locale,
}: {
  publication: Publication;
  locale: Locale;
}) {
  return (
    <article className="publication-detail">
      <Link className="back-link" href="/publications">
        ← Toutes les publications
      </Link>
      <div className="detail-meta">
        <span>{publicationTypeLabel(publication.type)}</span>
        <time dateTime={publication.createdAt.toISOString()}>
          {formatDate(publication.publishedAt ?? publication.createdAt)}
        </time>
      </div>
      <h1>{publication.title}</h1>
      <p className="detail-author">
        {publication.isAnonymous ? "Publié anonymement" : `Publié par ${publication.pseudonym}`}
      </p>
      <div className="detail-content">{publication.content}</div>
      <div className="detail-report">
        <strong>Un problème avec ce contenu ?</strong>
        <p>Signalez-le à la modération. Aucune adresse IP ni adresse email n’est demandée.</p>
        <ReportForm publicationId={publication.id} locale={locale} />
      </div>
    </article>
  );
}
