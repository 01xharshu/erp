import { retrieveContext } from "@/lib/ai/local-rag";
import { BRAND } from "@/lib/brand";

const OLLAMA_BASE = "http://127.0.0.1:11434";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, role = "student", uniqueId = "anonymous", userData, fastMode = false } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const latestMessage = messages[messages.length - 1];

    // Extract query text
    let userQuery = "";
    if (typeof latestMessage.content === "string") {
      userQuery = latestMessage.content;
    } else if (Array.isArray(latestMessage.parts)) {
      const textPart = latestMessage.parts.find((p: any) => p.type === "text");
      userQuery = textPart?.text || "";
    }

    if (!userQuery.trim()) {
      return new Response(JSON.stringify({ error: "Empty message" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Retrieve relevant campus knowledge - Reduce limit in fastMode for speed
    let context = "";
    try {
      context = await retrieveContext(userQuery, role, fastMode ? 3 : 5);
    } catch (err) {
      console.error("Vector retrieval failed:", err);
    }

    const systemPrompt = `You are "${BRAND.assistantName}", the intelligent heart of ${BRAND.name}.
You are currently interacting with a user with the role: ${role.toUpperCase()}.

Personality:
- Smart, insightful, and highly helpful.
- Professional yet conversational.
- Use bold text (**like this**) for emphasis and structure your answers with line breaks for readability.
- Avoid saying "As an AI..." or using robotic prefixes.
- Keep answers concise but informative.

Role-Specific Instructions:
- STUDENT: Help with their specific schedule, attendance, and fees records found in context or your Current User Details. Be encouraging and supportive. If they ask about "my" details (like my name, roll number, or marks), use the [Current Logged-in User Details] provided below.
- FACULTY: Be an efficient assistant. Help them find class schedules, student data, and attendance information quickly.
- ADMIN: Be an executive assistant. Help them find student data, management protocols, fee summaries, and institutional insights quickly.

Data Usage:
- Use the [Campus Knowledge Context] provided below to answer precisely.
- If specific records (like a student's details or a class time) are in the context, use them!
- If information is not in the context, use the [Current Logged-in User Details] if available.
- If information is missing from both, use your general intelligence but mention you are basing it on general knowledge if it's institution-specific.
- NEVER invent student or faculty records that are not in the context or user details.

[Campus Knowledge Context]:
${context || "No specific records found in the knowledge base for this query. Use the User Details or general intelligence to assist."}

${userData ? `[Current Logged-in User Details]:
You are directly speaking to this user. If they ask about "my" details, use this data:
${JSON.stringify(userData, null, 2)}` : "[Current Logged-in User Details]: No user details provided."}`;

    // Build Ollama chat messages array
    const ollamaMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: typeof m.content === "string"
          ? m.content
          : (Array.isArray(m.parts) ? m.parts.find((p: any) => p.type === "text")?.text || "" : ""),
      })),
    ];

    // Call Ollama chat API directly with streaming
    const ollamaRes = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        messages: ollamaMessages,
        stream: true,
        options: {
          num_ctx: 2048, // Optimize context window for speed
          temperature: 0.7,
        },
        keep_alive: "15m", // Keep model loaded for 15 minutes
      }),
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text().catch(() => "Unknown error");
      throw new Error(`Ollama returned ${ollamaRes.status}: ${errText}`);
    }

    // Transform Ollama's NDJSON stream into a plain text stream for the client
    const ollamaBody = ollamaRes.body;
    if (!ollamaBody) {
      throw new Error("No response body from Ollama");
    }

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        // Ollama sends newline-delimited JSON objects
        const lines = text.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              controller.enqueue(new TextEncoder().encode(data.message.content));
            }
          } catch {
            // Skip malformed lines
          }
        }
      },
    });

    const readableStream = ollamaBody.pipeThrough(transformStream);

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("AI Routing error:", error?.message || error);
    return new Response(
      JSON.stringify({
        error: `Failed to connect to Local AI. ${error?.message || "Please make sure Ollama is running."}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
