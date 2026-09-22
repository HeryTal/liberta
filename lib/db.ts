import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI must be configured to access MongoDB Atlas.");
  }

  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(uri, {
      appName: "liberta",
    });
  }

  // Await readiness before starting queries. A failed initial connection can
  // leave a closed topology that CRUD auto-connect will not reopen.
  // connect() reuses healthy connections and shares concurrent connection attempts.
  return await globalForMongo.mongoClient.connect();
}

export const databaseName = process.env.MONGO_DB_NAME ?? "liberta";
