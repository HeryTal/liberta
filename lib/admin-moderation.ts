import { databaseName, getMongoClient } from "@/lib/db";
import type { Publication } from "@/lib/publications";
import { ObjectId } from "mongodb";

type PendingDocument = Omit<Publication, "id"> & { _id: ObjectId };

export async function getPendingPublications(): Promise<Publication[]> {
  const documents = await getMongoClient()
    .db(databaseName)
    .collection<PendingDocument>("publications")
    .find({ status: "pending_review" })
    .sort({ createdAt: 1 })
    .limit(100)
    .toArray();

  return documents.map((document) => ({
    id: document._id.toHexString(),
    type: document.type,
    title: document.title,
    content: document.content,
    pseudonym: document.pseudonym,
    isAnonymous: document.isAnonymous,
    status: document.status,
    createdAt: document.createdAt,
    publishedAt: document.publishedAt,
  }));
}

export async function updatePublicationStatus(
  id: string,
  status: "published" | "removed",
): Promise<void> {
  if (!ObjectId.isValid(id)) {
    throw new Error("PUBLICATION_ID_INVALID");
  }

  await getMongoClient()
    .db(databaseName)
    .collection("publications")
    .updateOne(
      { _id: new ObjectId(id), status: "pending_review" },
      {
        $set: {
          status,
          publishedAt: status === "published" ? new Date() : null,
        },
      },
    );
}
