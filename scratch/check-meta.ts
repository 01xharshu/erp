import { getDatabase } from "../lib/mongodb";

async function check() {
  const db = await getDatabase();
  const meta = await db.collection("system_meta").findOne({ type: "academic_structure" });
  console.log(JSON.stringify(meta, null, 2));
  process.exit(0);
}

check();
