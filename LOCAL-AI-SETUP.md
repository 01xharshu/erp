# Local AI Chatbot Setup for Teachers

This guide will walk you through setting up the 100% free, local AI chatbot for teachers. It runs completely offline on your laptop using Ollama and utilizes the native Vercel AI SDK and local MongoDB collections for data ingestion (RAG).

## 1. Install Ollama

Ollama is the engine that runs Large Language Models locally.

1. Download Ollama from the official website: [https://ollama.com/download](https://ollama.com/download)
2. Install it on your Mac/Windows/Linux machine.

## 2. Download the Required AI Models

Our chatbot requires two distinct models:
- **`gemma2:2b`** - A fast, powerful local generation model from Google to generate chat text.
- **`nomic-embed-text`** - An optimized, lightweight text embedding model for converting your ERP data into vector shapes (so we can search).

Open your terminal and pull these models into your locally running Ollama software:

```bash
ollama run gemma2:2b
```
*(Once it finishes downloading and you see a prompt `>>>`, simply type `/bye` to exit. The model is now cached)*

```bash
ollama pull nomic-embed-text
```

## 3. Ingest Your Database Knowledge (RAG)

Because we are completely skipping paid SaaS tools, we rely on local scripts to generate Vector representations of your students, teachers, policies, and timetable.

The included `scripts/ingest.ts` parses your MongoDB collections, asks Ollama for an embedding shape via `nomic-embed-text`, and saves it to a new collection called `ai_knowledge_base`.

Run the ingestion script from your project root:

```bash
npm run ingest
# or
pnpm run ingest
```

*Note: Make sure Ollama is open/running in the background while performing this ingestion.*

## 4. Run the Project 

Now, just run your Next.js frontend as usual:

```bash
npm run dev
# or
pnpm dev
```

### How to test:
1. Log into the system using a Faculty or Admin account credential (like `FAC001` or `ADMIN001`).
2. Notice the modern SaaS-style **AI Assistant** button at the bottom right.
3. Chat with the assistant. Ask about specific test data (e.g., "Tell me about Ananya Gupta" or "What is Vikram Singh's specialization?").
4. If you aren't logged in as Faculty or Admin, the button elegantly hides itself to protect academic data.

### Notes:
- Since everything runs on localhost, there is **zero cost**, zero rate-limits, and **no active cloud API keys** required to chat. 
- You can freely customize the context gathering function directly inside `lib/ai/local-rag.ts`. Use `$vectorSearch` instead of Cosine Similarity if using Atlas DB down the line!
