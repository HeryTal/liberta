import { getLocale } from "@/lib/locale";
import { translations } from "@/lib/translations";

export async function PublishPanel() {
  const t = translations[await getLocale()];
  return (
    <section className="publish-panel" id="publier">
      <div className="publish-mark">L/01</div>
      <div>
        <p className="eyebrow">{t.newPublication}</p>
        <h2>{t.voiceIndex}</h2>
      </div>
      <div className="publish-action">
        <p>{t.visibility}</p>
        <span className="coming-soon">{t.formSoon}</span>
      </div>
    </section>
  );
}
