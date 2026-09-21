import { PublicationFeed } from "@/lib/publication-feed";
import { PublicationShell } from "@/lib/publication-shell";
import { getPublishedPublications } from "@/lib/publications";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
};

export default async function PublicationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const type =
    params.type === "testimony" || params.type === "named_accusation"
      ? params.type
      : undefined;
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) ? Math.max(parsedPage, 1) : 1;
  const result = await getPublishedPublications({ query, type, page });

  return (
    <PublicationShell>
      <PublicationFeed {...result} query={query} type={type} />
    </PublicationShell>
  );
}
