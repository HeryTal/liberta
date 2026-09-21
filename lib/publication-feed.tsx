import Link from "next/link";
import { PublicationList } from "@/lib/publication-list";
import type { Publication, PublishedPublicationsResult } from "@/lib/publications";

export function PublicationFeed({
  publications,
  query,
  type,
  page,
  pageSize,
  total,
  hasNextPage,
}: PublishedPublicationsResult & {
  query: string;
  type?: Publication["type"];
}) {
  const queryString = new URLSearchParams();
  if (query) queryString.set("q", query);
  if (type) queryString.set("type", type);
  const pageHref = (nextPage: number) => {
    queryString.set("page", String(nextPage));
    return `/publications?${queryString.toString()}`;
  };

  return (
    <section className="feed-section">
      <div className="feed-heading">
        <div>
          <p className="eyebrow">INDEX / PUBLICATIONS</p>
          <h1>Les voix publiées</h1>
        </div>
        <span>
          {total.toString().padStart(2, "0")} ÉLÉMENTS · PAGE {page}
        </span>
      </div>
      <form className="publication-filters" method="get">
        <label htmlFor="publication-search">Rechercher</label>
        <input
          id="publication-search"
          name="q"
          defaultValue={query}
          maxLength={80}
          placeholder="TITRE, TEXTE OU PSEUDO"
        />
        <label htmlFor="publication-type">Type</label>
        <select id="publication-type" name="type" defaultValue={type ?? ""}>
          <option value="">Tous les types</option>
          <option value="testimony">Témoignages</option>
          <option value="named_accusation">Accusations vérifiées</option>
        </select>
        <button type="submit">FILTRER ↗</button>
        {query || type ? <Link href="/publications">EFFACER</Link> : null}
      </form>
      <PublicationList publications={publications} />
      {total > pageSize ? (
        <nav className="publication-pagination" aria-label="Pagination des publications">
          {page > 1 ? <Link href={pageHref(page - 1)}>← PRÉCÉDENTE</Link> : <span />}
          <span>PAGE {page}</span>
          {hasNextPage ? <Link href={pageHref(page + 1)}>SUIVANTE →</Link> : <span />}
        </nav>
      ) : null}
    </section>
  );
}
