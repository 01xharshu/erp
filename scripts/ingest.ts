import { getDatabase } from "../lib/mongodb";

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("http://localhost:11434/api/embeddings", {
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
      throw new Error("Ollama is not running or model not found");
    }
    
    const data = await response.json();
    return data.embedding || [];
  } catch (error) {
    console.error("Local Ollama embedding error:", error);
    process.exit(1);
  }
}

async function ingest() {
  console.log("Starting Local RAG Knowledge Base Ingestion...");
  
  try {
    const db = await getDatabase();
    
    // Check if Ollama is running
    try {
      await fetch("http://localhost:11434/api/tags");
    } catch (e) {
      console.error("ERROR: Cannot connect to Ollama. Please make sure Ollama is running locally at http://localhost:11434");
      process.exit(1);
    }

    const kbCollection = db.collection("ai_knowledge_base");
    
    // Clear existing KB
    console.log("Clearing previous knowledge base...");
    await kbCollection.deleteMany({});
    
    const chunks: { source: string; content: string; allowedRoles: string[] }[] = [];

    // Fetch collections
    console.log("Fetching data from current collections...");
    const students = await db.collection("students").find({}).toArray();
    const faculty = await db.collection("faculty").find({}).toArray();
    const timetable = await db.collection("timetable").find({}).toArray();
    
    // Chunk rules - PUBLIC
    chunks.push({
      source: "Policy",
      content: "General Policy: Teachers must log attendance before 10 AM every day. Leave applications should be submitted 24 hours prior. Student assignments carry 20% grading weight.",
      allowedRoles: ["guest", "student", "faculty", "admin"]
    });

    chunks.push({
      source: "General",
      content: "About the College: This is a premier educational institution focused on excellence in engineering, science, and arts. We offer state-of-the-art labs, a modern library, and vibrant campus life.",
      allowedRoles: ["guest", "student", "faculty", "admin"]
    });

    chunks.push({
      source: "Admissions",
      content: "Admissions Information: New admissions are strictly based on entrance merit. Applications open every year in May. Required documents include academic transcripts, ID proof, and migration certificates.",
      allowedRoles: ["guest", "student", "faculty", "admin"]
    });

    // Chunk students - RESTRICTED
    students.forEach(student => {
      chunks.push({
        source: "Students",
        content: `Student Profile: Full Name is ${student.firstName} ${student.lastName}. 
        Enrollment No: ${student.enrollmentNo}. 
        Class Roll No: ${student.rollNo || "N/A"}.
        Department: ${student.department || "N/A"}. 
        Program: ${student.program || "N/A"}.
        Current Status: Semester ${student.semester || 1}, Year ${student.year || 1}. 
        Academic Merit: CGPA ${student.cgpa || 0}.
        Personal: Born on ${student.dateOfBirth || "N/A"}. 
        Address: ${student.address || "N/A"}.
        Admission Date: ${student.admissionDate || "N/A"}.
        Emergency Contact: Guardian ${student.guardianName || "N/A"} (${student.guardianPhone || "N/A"}).`,
        allowedRoles: ["admin", "faculty", "student"]
      });
    });

    // Chunk faculty - RESTRICTED
    faculty.forEach(fac => {
      chunks.push({
        source: "Faculty",
        content: `Faculty Profile: Name is ${fac.firstName} ${fac.lastName}, Department: ${fac.department}, Specialization: ${fac.specialization}, Designation: ${fac.designation}.`,
        allowedRoles: ["admin", "faculty", "student"] // Students can see faculty profiles
      });
    });

    // Chunk Timetable - RESTRICTED
    timetable.forEach(entry => {
      chunks.push({
        source: "Timetable",
        content: `Timetable: ${entry.role.toUpperCase()} ${entry.uniqueId} has ${entry.subject} class on Day ${entry.dayOfWeek} from ${entry.startTime} to ${entry.endTime} in room ${entry.room}.`,
        allowedRoles: ["admin", "faculty", "student"]
      });
    });

    // Embed and Save
    console.log(`Generating embeddings for ${chunks.length} chunks via local Ollama...`);
    const total = chunks.length;
    let completed = 0;

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);
      
      await kbCollection.insertOne({
        source: chunk.source,
        content: chunk.content,
        allowedRoles: chunk.allowedRoles,
        embedding: embedding,
        createdAt: new Date()
      });
      
      completed++;
      process.stdout.write(`\rProgress: ${completed}/${total} processed.`);
    }

    console.log("\n✅ AI Knowledge Base successfully updated & vectorized locally!");
    process.exit(0);

  } catch (error) {
    console.error("Ingestion failed:", error);
    process.exit(1);
  }
}

ingest();
