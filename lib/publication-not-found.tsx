import Link from "next/link";

export function PublicationNotFound() {
  return (
    <div className="empty-feed">
      <p className="eyebrow">404 / PUBLICATION</p>
      <h1>Publication introuvable.</h1>
      <Link className="back-link" href="/publications">
        Retour aux publications
      </Link>
    </div>
  );
}
