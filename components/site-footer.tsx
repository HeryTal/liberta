import { getLocale } from "@/lib/locale";
import { translations } from "@/lib/translations";

export async function SiteFooter() {
  const t = translations[await getLocale()];

  return (
    <footer id="a-propos">
      <div className="footer-big">LIBERTA</div>
      <div className="footer-grid">
        <div>
          <b>{t.mission}</b>
          <p>
            Faire circuler les témoignages et les idées, avec le moins de
            données possible.
          </p>
        </div>
        <div>
          <b>{t.languages}</b>
          <p>{t.frenchMalagasy}</p>
        </div>
        <div>
          <b>{t.access}</b>
          <p>
            Lecture libre · Publication anonyme
            <br />
            <a href="/feed.xml">{t.rss}</a>
          </p>
        </div>
        <div>
          <b>RETOUR</b>
          <p>
            <a href="#top">{t.backTop}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
