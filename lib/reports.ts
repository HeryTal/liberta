import { ObjectId } from "mongodb";
import { databaseName, getMongoClient } from "@/lib/db";
import type { ReportReason } from "@/lib/report-reasons";

export type Report = {
  id: string;
  publicationId: string;
  reason: ReportReason;
  details: string;
  status: "pending" | "reviewed";
  createdAt: Date;
};

export type { ReportReason };

type ReportDocument = Omit<Report, "id" | "publicationId"> & {
  _id: ObjectId;
  publicationId: ObjectId;
};

const collection = async () =>
  (await getMongoClient()).db(databaseName).collection<ReportDocument>("reports");

export async function createReport(input: {
  publicationId: string;
  reason: ReportReason;
  details: string;
}): Promise<void> {
  await (await collection()).insertOne({
    _id: new ObjectId(),
    publicationId: new ObjectId(input.publicationId),
    reason: input.reason,
    details: input.details,
    status: "pending",
    createdAt: new Date(),
  });
}

export async function getPendingReports(): Promise<Report[]> {
  const documents = await (await collection())
    .find({ status: "pending" })
    .sort({ createdAt: 1 })
    .limit(100)
    .toArray();

  return documents.map((document) => ({
    id: document._id.toHexString(),
    publicationId: document.publicationId.toHexString(),
    reason: document.reason,
    details: document.details,
    status: document.status,
    createdAt: document.createdAt,
  }));
}

export async function markReportReviewed(id: string): Promise<void> {
  if (!ObjectId.isValid(id)) {
    throw new Error("INVALID_REPORT_ID");
  }

  await (await collection()).updateOne(
    { _id: new ObjectId(id), status: "pending" },
    { $set: { status: "reviewed" } },
  );
}
