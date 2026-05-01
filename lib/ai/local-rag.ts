import { getDatabase } from "@/lib/mongodb";

export async function generateNomicEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("http://127.0.0.1:11434/api/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "nomic-embed-text",
        prompt: text,
      }),
    });
    
    if (!response.ok) {
      console.warn("Failed to generate embedding from Ollama (is it running?)");
      return [];
    }
    
    const data = await response.json();
    return data.embedding || [];
  } catch (error) {
    console.error("Local Ollama embedding error:", error);
    return [];
  }
}

// Cosine similarity fallback for strictly local instances without Atlas Vector Search
function cosineSimilarity(A: number[], B: number[]) {
  if (A.length !== B.length || A.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface KBDocument {
  _id?: any;
  content: string;
  embedding: number[];
  source: string;
}

export async function retrieveContext(query: string, role: string = "student", limit = 10): Promise<string> {
  const queryEmbedding = await generateNomicEmbedding(query);
  if (!queryEmbedding.length) {
    return ""; // Ollama probably not running
  }

  const db = await getDatabase();
  const collection = db.collection<any>("ai_knowledge_base");
  
  // Only fetch documents that this role is allowed to see
  const allDocs = await collection.find({
    allowedRoles: { $in: [role] }
  }).toArray();
  
  if (allDocs.length === 0) return "";

  const scoredDocs = allDocs.map(doc => {
    const score = doc.embedding ? cosineSimilarity(queryEmbedding, doc.embedding) : 0;
    return { ...doc, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  
  const topDocs = scoredDocs.filter((d: any) => !isNaN(d.score) && d.score > 0.4).slice(0, limit);
  
  return topDocs.map((doc: any) => `[Source: ${doc.source}] ${doc.content}`).join("\n\n");
}

export async function syncKnowledgeBase(documents: { content: string, source: string, allowedRoles: string[] }[]) {
  const db = await getDatabase();
  const collection = db.collection<any>("ai_knowledge_base");
  
  // Clear old knowledge
  await collection.deleteMany({});
  
  // Process documents in batches to avoid overwhelming Ollama
  for (const doc of documents) {
    const embedding = await generateNomicEmbedding(doc.content);
    if (embedding.length > 0) {
      await collection.insertOne({
        ...doc,
        embedding,
        updatedAt: new Date()
      });
    }
  }
}
