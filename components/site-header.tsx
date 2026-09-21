import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { translations } from "@/lib/translations";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = translations[locale];
  const returnTo = "/";

  return (
    <>
      <header className="masthead" id="top">
        <Link href="/" className="brand" aria-label="Liberta, accueil">
          <span>LIBERTA</span> <i>/</i> PAROLE LIBRE
        </Link>
        <div className="meta">
          <strong>MADAGASCAR</strong>
          <span>{t.publicReading}</span>
          <span>{t.edition}</span>
        </div>
      </header>
      <nav className="navbar" aria-label={t.home}>
        <Link href="/" className="navbar-link navbar-home">
          {t.home}
        </Link>
        <Link href="/publications" className="navbar-link">
          {t.publications}
        </Link>
        <Link href="/publier" className="navbar-link">
          {t.publish}
        </Link>
        <Link href="#a-propos" className="navbar-link">
          {t.about}
        </Link>
        <div className="navbar-language" aria-label="Langue active">
          <a href={`/api/locale?locale=fr&returnTo=${returnTo}`} aria-current={locale === "fr" ? "true" : undefined}>FR</a>
          {" / "}
          <a href={`/api/locale?locale=mg&returnTo=${returnTo}`} aria-current={locale === "mg" ? "true" : undefined}>MG</a>
        </div>
      </nav>
    </>
  );
}
