import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAI } from "openai";
import { Document } from "@langchain/core/documents";
import * as pdfjs from "pdfjs-dist";

// Initialize PDF.js worker
// In a server environment, we don't need a worker path if we use the standard build
// However, pdfjs-dist can be tricky. Let's use a robust approach for Vercel.

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
 * Extracts text from a PDF buffer using pdfjs-dist
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({ data });
  const pdfDocument = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(" ") + "\n";
  }

  return fullText;
}

export async function indexDocument(file: Blob, fileName: string) {
  console.log(`[Indexing] Starting indexing for: ${fileName}`);
  
  let docs: Document[] = [];

  try {
    if (fileName.toLowerCase().endsWith(".pdf")) {
      console.log("[Indexing] Parsing PDF with pdfjs-dist...");
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractTextFromPDF(buffer);
      
      docs = [new Document({ 
        pageContent: text, 
        metadata: { fileName, source: fileName } 
      })];
      console.log(`[Indexing] PDF parsed successfully. Character count: ${text.length}`);
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

export async function queryDocument(userQuery: string) {
  try {
    console.log(`[Query] User query: ${userQuery}`);
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, qdrantConfig);
    
    const retriever = vectorStore.asRetriever({
      k: 5,
    });

    const relevantChunks = await retriever.invoke(userQuery);
    console.log(`[Query] Retrieved ${relevantChunks.length} relevant chunks`);

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const context = relevantChunks
      .map((chunk) => `[Content]: ${chunk.pageContent}\n[Metadata]: ${JSON.stringify(chunk.metadata)}`)
      .join("\n\n");

    const systemPrompt = `You are an AI Assistant specializing in document analysis.
Your goal is to answer the user's question based ONLY on the provided context.
If the answer is not in the context, say you don't know based on the document.
Be precise, professional, and reference the source when possible.

Context:
${context}`;

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
      sources: relevantChunks.map((c) => c.metadata),
    };
  } catch (error: any) {
    console.error("[Query Error]", error);
    throw new Error(`Failed to query document: ${error.message}`);
  }
}
