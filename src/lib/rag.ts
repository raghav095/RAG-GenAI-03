import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAI } from "openai";
import { Document } from "@langchain/core/documents";
import { getDocumentProxy, extractText } from "unpdf";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const qdrantConfig = {
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  collectionName: process.env.QDRANT_COLLECTION_NAME || "notebook-lm-v2",
};

/**
 * Extracts text from a PDF buffer using unpdf
 * unpdf is a modern, worker-free wrapper around pdf.js
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf);
  return Array.isArray(text) ? text.join("\n") : text;
}

export async function indexDocument(file: Blob, fileName: string) {
  console.log(`[Indexing] Starting indexing for: ${fileName}`);
  
  let docs: Document[] = [];

  try {
    if (fileName.toLowerCase().endsWith(".pdf")) {
      console.log("[Indexing] Parsing PDF with unpdf...");
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractTextFromPDF(buffer);
      
      docs = [new Document({ 
        pageContent: text, 
        metadata: { fileName, source: fileName } 
      })];
      console.log(`[Indexing] PDF parsed successfully. Character count: ${text.length}`);
    } else if (fileName.toLowerCase().endsWith(".csv")) {
      console.log("[Indexing] Loading CSV file...");
      const text = await file.text();
      // Simple CSV parsing: assumes first row is headers
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
      if (lines.length > 0) {
        const headers = lines[0].split(",");
        docs = lines.slice(1).map((line, index) => {
          const values = line.split(",");
          const structuredContent = headers
            .map((h, i) => `${h.trim()}: ${values[i] ? values[i].trim() : ""}`)
            .join("\n");
          return new Document({
            pageContent: structuredContent,
            metadata: { fileName, source: fileName, row: index + 1 },
          });
        });
      }
    } else {
      console.log("[Indexing] Loading Text file...");
      const text = await file.text();
      docs = [new Document({ 
        pageContent: text, 
        metadata: { fileName, source: fileName } 
      })];
    }

    // Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`[Indexing] Split into ${splitDocs.length} chunks`);

    // Add metadata
    const docsWithMetadata = splitDocs.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        fileName,
      },
    }));

    console.log("[Indexing] Uploading to Qdrant...");
    try {
      await QdrantVectorStore.fromDocuments(docsWithMetadata, embeddings, qdrantConfig);
      console.log("[Indexing] Successfully uploaded to Qdrant");
    } catch (qdrantError: any) {
      console.error("[Indexing] Qdrant upload failed:", qdrantError);
      throw new Error(`Qdrant error: ${qdrantError.message}`);
    }

    return { success: true, chunks: docsWithMetadata.length };
  } catch (error: any) {
    console.error("[Indexing Error]", error);
    throw new Error(`Failed to index document: ${error.message}`);
  }
}

export async function queryDocument(userQuery: string, activeFiles: string[] = []) {
  try {
    console.log(`[Query] User query: ${userQuery} | Active Files: ${activeFiles.join(", ")}`);
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, qdrantConfig);
    
    // Create a filter to only search within the active files
    const filter = activeFiles.length > 0 ? {
      must: [
        {
          key: "metadata.fileName",
          match: {
            any: activeFiles,
          },
        },
      ],
    } : undefined;

    const retriever = vectorStore.asRetriever({
      k: 5,
      filter: filter,
    });

    // 1. Retrieve
    const relevantChunks = await retriever.invoke(userQuery);
    console.log(`[Query] Retrieved ${relevantChunks.length} relevant chunks`);

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 2. Evaluate (Corrective RAG Step)
    console.log("[CRAG] Evaluating retrieved chunks...");
    const evaluationPromises = relevantChunks.map(async (chunk) => {
      const evalPrompt = `You are a grader assessing relevance of a retrieved document to a user question.
Document:
${chunk.pageContent}

User question: ${userQuery}

If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant.
Reply with exactly "yes" if relevant, or "no" if irrelevant.`;

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: evalPrompt }],
        temperature: 0,
      });

      const grade = response.choices[0].message.content?.trim().toLowerCase();
      return { chunk, relevant: grade === "yes" };
    });

    const evaluatedChunks = await Promise.all(evaluationPromises);
    const relevantDocs = evaluatedChunks.filter(c => c.relevant).map(c => c.chunk);
    console.log(`[CRAG] ${relevantDocs.length} out of ${relevantChunks.length} chunks deemed relevant.`);

    let context = "";
    let sources: any[] = [];

    if (relevantDocs.length > 0) {
      // 3a. Use Relevant Documents
      context = relevantDocs
        .map((chunk) => `[Source: ${chunk.metadata.fileName}]: ${chunk.pageContent}`)
        .join("\n\n");
      sources = relevantDocs.map((c) => c.metadata);
    } else {
      // 3b. Fallback to Web Search (using Wikipedia as a free alternative)
      console.log("[CRAG] No relevant chunks found. Falling back to external search...");
      const { WikipediaQueryRun } = await import("@langchain/community/tools/wikipedia_query_run");
      
      const searchTool = new WikipediaQueryRun({
        topKResults: 3,
        maxDocContentLength: 4000,
      });

      // Rewrite query for better search
      const rewriteResponse = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an AI assistant that reformulates user queries into optimal search engine queries. Reply ONLY with the rewritten search query. No quotes or extra text." },
          { role: "user", content: `Original query: ${userQuery}` }
        ],
        temperature: 0
      });
      const optimizedQuery = rewriteResponse.choices[0].message.content?.trim() || userQuery;
      console.log(`[CRAG] Rewrote query to: ${optimizedQuery}`);

      const searchResultStr = await searchTool.invoke(optimizedQuery);
      context = `[Source: Wikipedia Search]:\n${searchResultStr}`;
      sources = [{ fileName: "Wikipedia Search", source: "web" }];
    }

    const systemPrompt = `You are an AI Assistant specializing in document analysis.
Your goal is to answer the user's question based ONLY on the provided context.
If the answer is not in the context, say you don't know based on the document.
Be precise, professional, and reference the source when possible.

Context:
${context}`;

    // 4. Generate Final Answer
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
      temperature: 0,
    });

    return {
      answer: response.choices[0].message.content,
      sources: sources,
    };
  } catch (error: any) {
    console.error("[Query Error]", error);
    throw new Error(`Failed to query document: ${error.message}`);
  }
}
