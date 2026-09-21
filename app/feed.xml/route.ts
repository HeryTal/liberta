import { getPublishedPublications } from "@/lib/publications";

export const dynamic = "force-dynamic";

const defaultSiteUrl = "http://localhost:3000";

export async function GET(): Promise<Response> {
  const siteUrl = (process.env.SITE_URL ?? defaultSiteUrl).replace(/\/+$/, "");
  const { publications } = await getPublishedPublications({ pageSize: 50 });
  const items = publications
    .map((publication) => {
      const publicationUrl = `${siteUrl}/publications/${publication.id}`;
      const date = publication.publishedAt ?? publication.createdAt;

      return [
        "<item>",
        `<title>${escapeXml(publication.title)}</title>`,
        `<link>${escapeXml(publicationUrl)}</link>`,
        `<guid isPermaLink="true">${escapeXml(publicationUrl)}</guid>`,
        `<pubDate>${date.toUTCString()}</pubDate>`,
        `<description>${escapeXml(publication.content)}</description>`,
        "</item>",
      ].join("");
    })
    .join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    "<title>Liberta — La parole libre à Madagascar</title>",
    `<link>${escapeXml(siteUrl)}</link>`,
    "<description>Les dernières publications publiques de Liberta.</description>",
    "<language>fr</language>",
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
