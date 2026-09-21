import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicationDetail } from "@/lib/publication-detail";
import { PublicationShell } from "@/lib/publication-shell";
import { getPublishedPublication } from "@/lib/publications";
import { getLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const publication = await getPublishedPublication(id);

  return publication
    ? {
        title: publication.title,
        description: publication.content.slice(0, 160),
      }
    : { title: "Publication introuvable" };
}

export default async function PublicationPage({ params }: Props) {
  const { id } = await params;
  const publication = await getPublishedPublication(id);

  if (!publication) {
    notFound();
  }

  const locale = await getLocale();

  return (
    <PublicationShell>
      <PublicationDetail publication={publication} locale={locale} />
    </PublicationShell>
  );
}
