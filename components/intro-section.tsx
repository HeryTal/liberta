import { getLocale } from "@/lib/locale";
import { translations } from "@/lib/translations";

export async function IntroSection() {
  const t = translations[await getLocale()];
  return (
    <section className="intro">
      <div>
        <p className="eyebrow">{t.independent}</p>
        <h1>
          DIRE
          <br />
          <span>CE QUE</span>
          <br />
          L&apos;ON PENSE.
        </h1>
      </div>
      <div className="intro-note">
        <p className="signal">{t.online}</p>
        <p>
          Un espace public pour les voix de Madagascar. Publiez anonymement ou
          avec un pseudo. Aucun compte n&apos;est nécessaire pour lire.
        </p>
        <span className="stamp">{t.minimalData}</span>
      </div>
    </section>
  );
}
