# 📓 NotebookLM RAG Clone

A premium, RAG-powered document assistant that lets you "talk" to your PDFs, CSVs, and text files.

![Premium UI](https://img.shields.io/badge/UI-Premium-blueviolet)
![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black)
![LangChain](https://img.shields.io/badge/RAG-LangChain-green)
![Qdrant](https://img.shields.io/badge/VectorDB-Qdrant-red)

## ✨ Features
- **Modern Obsidian Design**: Sleek dark mode with glassmorphism effects.
- **Instant Indexing**: Upload and process documents in seconds.
- **Grounded Answers**: LLM responses are strictly based on document content.
- **Animated Interface**: Smooth transitions and interactive elements.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API Key
- Qdrant Cloud Cluster

### Setup
1. **Clone & Install**
   ```bash
   git clone <your-repo-link>
   cd RAg
   npm install --legacy-peer-deps
   ```

2. **Environment Variables**
   Create a `.env` file in the root:
   ```env
   OPENAI_API_KEY=your_key
   QDRANT_URL=your_qdrant_url
   QDRANT_API_KEY=your_qdrant_api_key
   QDRANT_COLLECTION_NAME=notebook-lm
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🧠 Pipeline Architecture
See [DOCUMENTATION.md](./DOCUMENTATION.md) for a deep dive into the chunking, embedding, and retrieval strategies.

## 📄 License
MIT
