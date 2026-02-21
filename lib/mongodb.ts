import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("college_erp");

    cachedClient = client;
    cachedDb = db;

    console.log("[v0] Connected to MongoDB");
    return { client, db };
  } catch (error) {
    console.error("[v0] Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}
