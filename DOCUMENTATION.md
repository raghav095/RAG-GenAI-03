# NotebookLM RAG Clone - Documentation

## Overview
This application is a high-fidelity clone of Google NotebookLM's core functionality. It allows users to upload documents (PDF or Text) and have a natural language conversation grounded in the document's content.

## Technical Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, Lucide React.
- **RAG Framework**: LangChain.js.
- **Embeddings**: OpenAI `text-embedding-3-large`.
- **Vector Database**: Qdrant (Cloud).
- **LLM**: OpenAI `gpt-4o-mini`.

## RAG Pipeline

### 1. Ingestion & Loading
Documents are uploaded via a multipart/form-data POST request. We use `@langchain/community/document_loaders/fs/pdf` to parse PDF files into a standardized document format.

### 2. Chunking Strategy
We implement a **Recursive Character Chunking** strategy using `RecursiveCharacterTextSplitter`.
- **Chunk Size**: 1000 characters.
- **Chunk Overlap**: 200 characters.
- **Why?**: This strategy ensures that chunks are large enough to contain meaningful context while the overlap prevents information loss at the boundaries of chunks.

### 3. Embedding & Indexing
Each chunk is converted into a 3072-dimensional vector using OpenAI's `text-embedding-3-large` model and stored in a Qdrant collection.

### 4. Retrieval
When a user asks a question:
1. The query is embedded using the same OpenAI model.
2. We perform a similarity search in Qdrant to retrieve the top 5 most relevant chunks.

### 5. Generation
The retrieved chunks are injected into a system prompt:
- **System Prompt**: Instructs the model to answer *only* based on the provided context.
- **Model**: `gpt-4o-mini` is used for its balance of speed and reasoning capability.

## How to Run
1. Clone the repository.
2. Install dependencies: `npm install --legacy-peer-deps`.
3. Set up `.env` with:
   - `OPENAI_API_KEY`
   - `QDRANT_URL`
   - `QDRANT_API_KEY`
   - `QDRANT_COLLECTION_NAME`
4. Run `npm run dev`.
