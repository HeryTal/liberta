import { ObjectId } from "mongodb";
import { databaseName, getMongoClient } from "@/lib/db";

export type ModerationAction =
  | "publication_published"
  | "publication_removed"
  | "report_reviewed";

export type ModerationLog = {
  id: string;
  action: ModerationAction;
  targetId: string;
  adminUsername: string;
  createdAt: Date;
};

type ModerationLogDocument = Omit<ModerationLog, "id" | "targetId"> & {
  _id: ObjectId;
  targetId: ObjectId;
};

const collection = async () =>
  (await getMongoClient()).db(databaseName).collection<ModerationLogDocument>("moderation_logs");

export async function recordModerationAction(input: {
  action: ModerationAction;
  targetId: string;
  adminUsername: string;
}): Promise<void> {
  if (!ObjectId.isValid(input.targetId)) {
    throw new Error("INVALID_MODERATION_TARGET_ID");
  }

  await (await collection()).insertOne({
    _id: new ObjectId(),
    action: input.action,
    targetId: new ObjectId(input.targetId),
    adminUsername: input.adminUsername,
    createdAt: new Date(),
  });
}

export async function getRecentModerationLogs(): Promise<ModerationLog[]> {
  const documents = await (await collection())
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return documents.map((document) => ({
    id: document._id.toHexString(),
    action: document.action,
    targetId: document.targetId.toHexString(),
    adminUsername: document.adminUsername,
    createdAt: document.createdAt,
  }));
}
