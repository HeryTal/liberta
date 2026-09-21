import { PublicationForm } from "@/components/publication-form";
import { PublicationShell } from "@/lib/publication-shell";
import { getLocale } from "@/lib/locale";

export default async function PublishPage() {
  const locale = await getLocale();
  return (
    <PublicationShell>
      <section className="publish-page">
        <div className="publish-page-heading">
          <p className="eyebrow">NOUVELLE PUBLICATION / SANS COMPTE</p>
          <h1>Votre voix entre dans l&apos;index.</h1>
          <p>
            Partagez un témoignage avec votre nom, un pseudo ou sans signature.
            Les accusations nominatives restent en attente de vérification.
          </p>
        </div>
        <PublicationForm locale={locale} />
      </section>
    </PublicationShell>
  );
}
