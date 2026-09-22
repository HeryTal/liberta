import { getLocale } from "@/lib/locale";
import { translations } from "@/lib/translations";

export async function MissionSections() {
  const t = translations[await getLocale()];

  return (
    <>
      <section className="mission-section">
        <div className="mission-label">
          <span>01</span>
          <span>MANIFESTE</span>
        </div>
        <div className="mission-copy">
          <h2>{t.whyTitle}</h2>
          <p>{t.whyText}</p>
        </div>
      </section>
      <section className="how-section">
        <div className="how-heading">
          <p className="eyebrow">LIBERTA / MODE D&apos;EMPLOI</p>
          <h2>{t.howTitle}</h2>
        </div>
        <div className="how-grid">
          <article><span>{t.howStepOne}</span><p>{t.howStepOneText}</p></article>
          <article><span>{t.howStepTwo}</span><p>{t.howStepTwoText}</p></article>
          <article><span>{t.howStepThree}</span><p>{t.howStepThreeText}</p></article>
        </div>
      </section>
      <section className="principles-section">
        <div className="principles-heading">
          <p className="eyebrow">LIBERTA / ENGAGEMENTS</p>
          <h2>{t.principlesTitle}</h2>
        </div>
        <div className="principles-grid">
          <article><strong>{t.principleOne}</strong><p>{t.principleOneText}</p></article>
          <article><strong>{t.principleTwo}</strong><p>{t.principleTwoText}</p></article>
          <article><strong>{t.principleThree}</strong><p>{t.principleThreeText}</p></article>
        </div>
      </section>
    </>
  );
}
