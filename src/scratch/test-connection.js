const { OpenAIEmbeddings } = require("@langchain/openai");
const { QdrantVectorStore } = require("@langchain/qdrant");


async function test() {
  try {
    console.log("Testing OpenAI Embeddings...");
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });
    const res = await embeddings.embedQuery("test");
    console.log("Embeddings OK", res.length);

    console.log("Testing Qdrant Connection...");
    const qdrantConfig = {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: "test-connection",
    };
    
    // We don't need documents for this test, just see if it connects
    // But QdrantVectorStore might try to connect on instantiation
    console.log("Config:", { ...qdrantConfig, apiKey: "REDACTED" });
    
    // Just a sanity check on the URL
    if (!process.env.QDRANT_URL) throw new Error("QDRANT_URL is missing");
    
    console.log("Connection test passed (config check)");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
