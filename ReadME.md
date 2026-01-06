# Nigeria Tax RAG Agent

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![LangChain](https://img.shields.io/badge/LangChain-0.2+-1C3C3C.svg?style=flat&logo=langchain&logoColor=white)](https://www.langchain.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Latest-1C3C3C.svg?style=flat&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-000000.svg?style=flat&logo=openai)](https://platform.openai.com/)
[![Chroma](https://img.shields.io/badge/Chroma-Vector_DB-4B8BFE.svg?style=flat)](https://www.trychroma.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An **agentic Retrieval-Augmented Generation (RAG)** system specialized in answering questions about Nigerian tax laws and reforms, powered by **LangGraph** for stateful workflows and **LangChain** for tool orchestration.

This agent retrieves authoritative information from a curated knowledge base of tax documents (Acts, Bills, analyses) stored in a **Chroma** vector database and provides accurate, concise responses. It features **smart multilingual output** – automatically detecting requests for translations (e.g., Yoruba, Pidgin, Hausa, Igbo) and delivering responses in English + the requested language(s).

Ideal for tax consultants, legal researchers, policymakers, or anyone needing reliable insights into Nigeria's evolving tax landscape.

## ✨ Key Features

- **Authoritative Retrieval**: Multiple specialized retrieval tools prioritizing legal hierarchy (Acts > Bills > Guidance > Analyses)
- **Agentic Workflow**: Built with LangGraph for conditional routing, tool selection, and robust error handling
- **Multilingual Support**: Intelligent detection and translation into Nigerian languages (Yoruba, Pidgin, Hausa, Igbo) while preserving legal accuracy
- **Session Memory**: Conversation history preserved per thread/session
- **Citation Support**: Responses include source metadata (file path, page, document type)
- **Extensible Design**: Easy to add new retrieval strategies or tools

## 🛠️ Tech Stack

- **Python** 3.10+
- **LangChain** & **LangGraph** – Core orchestration and agent framework
- **OpenAI** (gpt-4o-mini) – LLM for reasoning and multilingual summarization
- **Chroma** – Local persistent vector store with OpenAI embeddings
- **dotenv** – Environment variable management

## 🚀 Quick Start

### Clone the Repository

```bash
git clone https://github.com/yourusername/nigeria-tax-rag-agent.git
cd nigeria-tax-rag-agent
```

##  Set Up a Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

##  Install Dependencies

pip install -r requirements.txt

Note: A sample requirements.txt should include:

langchain
langgraph
langchain-openai
langchain-chroma
chromadb
python-dotenv
PyJWT
bcrypt
fastapi

## Configure Environment Variables

OPENAI_API_KEY=your_openai_api_key_here

## Prepare the Knowledge Base
This is where the vector database should be pre-populated with Nigerian tax documents (PDFs in a structured folder, e.g., nigeria_tax_rag/data/raw_pdfs/)., run it once:

python build_index.py 

The agent expects a Chroma collection at ./chroma_db (configurable in code).

 ## Architecture Overview

Retrieval Tools: General, authority-prioritized, recent documents, definitions
Agent Node: LLM decides when/if to use tools based on strict guidelines
Multilingual Node: Final post-processing step that invokes a dedicated tool for language-aware summarization
Graph Flow: START → assistant → (tools)* → multilingual → END

## Contributing
Contributions are welcome! Feel free to:Add new retrieval strategies
Improve multilingual prompts
Enhance document ingestion
Submit bug fixes or feature requests

Please open an issue first for major changes.

## License
This project is licensed under the MIT License – see LICENSE for details.

Built with love for accessible, accurate tax information in Nigeria.
Questions? Open an issue or reach out!





