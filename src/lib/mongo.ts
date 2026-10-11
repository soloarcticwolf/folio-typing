import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB ?? "docviewer";

type GlobalMongo = typeof globalThis & { __mongoClient?: Promise<MongoClient> };

function getClientPromise(): Promise<MongoClient> {
  const g = globalThis as GlobalMongo;
  if (!g.__mongoClient) {
    if (!uri) throw new Error("MONGODB_URI is not set");
    const client = new MongoClient(uri);
    g.__mongoClient = client.connect();
  }
  return g.__mongoClient;
}

export async function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
