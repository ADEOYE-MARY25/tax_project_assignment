# Load PDFs

# Clean & structure metadata

# Build vector index

# Run once (offline step)

import os
from datetime import datetime
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

# Load API key
load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not found! Please set it in your .env file.")

print("API key loaded")
load_dotenv()

class TaxIndexBuilder:
    def __init__(self, base_dir: str, persist_dir: str):
       
        self.base_dir = base_dir
        self.persist_dir = persist_dir
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=openai_api_key
        )
        self.all_pages: list[Document] = []

    def load_pdfs(self, folder: str, category: str, doc_type: str | None):
        loader = DirectoryLoader(
            os.path.join(self.base_dir, folder),
            glob="**/*.pdf",
            loader_cls=PyPDFLoader,
            show_progress=True
        )

        docs = loader.load()

        for idx, doc in enumerate(docs):
            source = doc.metadata.get("source", "")
            file_name = os.path.basename(source)

            self.all_pages.append(
                Document(
                    page_content=doc.page_content,
                    metadata={
                        "category": category,
                        "type": doc_type or category,
                        "file": file_name,
                        "page": doc.metadata.get("page"),
                        "source_path": source,
                        "creation_date": datetime.now().isoformat(),
                        "chunk_index": idx,
                    }
                )
            )

    def build(self):
        pdf_folders = [
            ("analysis", "analysis", None),
            ("executive_guidance", "executive_guidance", None),
            ("primary_law/acts", "primary_law", "acts"),
            ("primary_law/bills", "primary_law", "bills"),
        ]

        for folder, category, doc_type in pdf_folders:
            self.load_pdfs(folder, category, doc_type)

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=900,
            chunk_overlap=120,
            separators=["\n\n", "\n", ".", " ", ""]
        )

        chunks = splitter.split_documents(self.all_pages)

        print(f"Created {len(chunks)} chunks")
        print(f"\nSample chunk:")
        print(f"{chunks[1].page_content[:100]}...")

        vectorstore = Chroma(
            collection_name="Tax_agentic_rag_docs",
            persist_directory=self.persist_dir,
            embedding_function=self.embeddings
        )

        vectorstore.add_documents(chunks)
        
        print(f"Index built with {len(chunks)} chunks")
        print(f"Persisted to: {self.persist_dir}")



if __name__ == "__main__":
    builder = TaxIndexBuilder(
        base_dir="nigeria_tax_rag/Backend/raw_pdfs",
        persist_dir="chroma_db_agentic_tax_rag"
    )
    builder.build()

# To run the index builder, use the command:
# python build_index.py