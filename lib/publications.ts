import { ObjectId } from "mongodb";
import { databaseName, getMongoClient } from "@/lib/db";

export type PublicationType = "testimony" | "named_accusation";
export type PublicationStatus = "pending_review" | "published" | "removed";

export type Publication = {
  id: string;
  type: PublicationType;
  title: string;
  content: string;
  pseudonym: string | null;
  isAnonymous: boolean;
  status: PublicationStatus;
  createdAt: Date;
  publishedAt: Date | null;
};

type PublicationDocument = Omit<Publication, "id"> & {
  _id: ObjectId;
};

const collection = () =>
  getMongoClient()
    .db(databaseName)
    .collection<PublicationDocument>("publications");

export type PublishedPublicationsResult = {
  publications: Publication[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
};

export async function getPublishedPublications(options?: {
  query?: string;
  type?: PublicationType;
  page?: number;
  pageSize?: number;
}): Promise<PublishedPublicationsResult> {
  const query = options?.query?.trim().slice(0, 80);
  const pageSize = Math.min(Math.max(options?.pageSize ?? 20, 1), 50);
  const page = Math.min(Math.max(options?.page ?? 1, 1), 1000);
  const filter: Record<string, unknown> = { status: "published" };

  if (options?.type) {
    filter.type = options.type;
  }

  if (query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escapedQuery, "i");
    filter.$or = [{ title: pattern }, { content: pattern }, { pseudonym: pattern }];
  }

  const publicationsCollection = collection();
  const [total, documents] = await Promise.all([
    publicationsCollection.countDocuments(filter),
    publicationsCollection
      .find(filter)
      .sort({ publishedAt: -1, createdAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
  ]);

  return {
    publications: documents.map(toPublication),
    page,
    pageSize,
    total,
    hasNextPage: page * pageSize < total,
  };
}

export async function getPublishedPublication(
  id: string,
): Promise<Publication | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const document = await collection().findOne({
    _id: new ObjectId(id),
    status: "published",
  });

  return document ? toPublication(document) : null;
}

function toPublication(document: PublicationDocument): Publication {
  return {
    id: document._id.toHexString(),
    type: document.type,
    title: document.title,
    content: document.content,
    pseudonym: document.pseudonym,
    isAnonymous: document.isAnonymous,
    status: document.status,
    createdAt: document.createdAt,
    publishedAt: document.publishedAt,
  };
}
