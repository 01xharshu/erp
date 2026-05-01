const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const meta = await db.collection("system_meta").findOne({ type: "academic_structure" });
    console.log(JSON.stringify(meta, null, 2));
  } finally {
    await client.close();
  }
}
run();
