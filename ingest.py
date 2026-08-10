import os
from langchain_community.document_loaders import DirectoryLoader, TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from config import (
    DOCUMENTS_DIR, 
    CHROMA_PERSIST_DIR, 
    EMBEDDING_MODEL_NAME, 
    CHUNK_SIZE, 
    CHUNK_OVERLAP,
    OPENAI_API_KEY,
    GROQ_API_KEY
)

class LocalDefaultEmbeddings(Embeddings):
    """Free, local CPU embeddings using Chroma Default ONNX model."""
    def __init__(self):
        from chromadb.utils import embedding_functions
        self.ef = embedding_functions.DefaultEmbeddingFunction()
        
    def embed_documents(self, texts):
        return self.ef(texts)
        
    def embed_query(self, text):
        return self.ef([text])[0]

def ingest_documents():
    if not os.path.exists(DOCUMENTS_DIR):
        print(f"Creating documents directory at {DOCUMENTS_DIR}")
        os.makedirs(DOCUMENTS_DIR)
        print("Please add some .txt or .pdf files to the documents directory and run again.")
        return

    # Load documents
    print("Loading documents...")
    txt_loader = DirectoryLoader(DOCUMENTS_DIR, glob="**/*.txt", loader_cls=TextLoader)
    pdf_loader = DirectoryLoader(DOCUMENTS_DIR, glob="**/*.pdf", loader_cls=PyPDFLoader)
    
    documents = txt_loader.load()
    documents.extend(pdf_loader.load())

    if not documents:
        print("No documents found in the documents directory.")
        return

    print(f"Loaded {len(documents)} documents.")

    # Chunking
    print("Chunking documents...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        add_start_index=True
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks.")

    # Embeddings and Vector Store
    print("Generating embeddings and storing in ChromaDB...")
    if OPENAI_API_KEY and not OPENAI_API_KEY.startswith("your_openai"):
        embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL_NAME)
    else:
        print("Using Free Local Embeddings (Chroma Default)...")
        embeddings = LocalDefaultEmbeddings()
    
    # Create or update ChromaDB
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PERSIST_DIR
    )
    
    print(f"Successfully ingested and persisted embeddings to {CHROMA_PERSIST_DIR}")

if __name__ == "__main__":
    ingest_documents()
