import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

export function getMongoClient(): MongoClient {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI must be configured to access MongoDB Atlas.");
  }

  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(uri, {
      appName: "liberta",
    });
  }

  return globalForMongo.mongoClient;
}

export const databaseName = process.env.MONGO_DB_NAME ?? "liberta";
