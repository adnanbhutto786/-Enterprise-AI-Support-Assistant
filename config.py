import os
from dotenv import load_dotenv

load_dotenv()

# Configuration Settings
CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
DOCUMENTS_DIR = os.path.join(os.path.dirname(__file__), "documents")

# API Keys (Groq is free & high performance; OpenAI is also supported)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Embedding Model Config
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "text-embedding-3-small")

# LLM Config & Provider detection
if GROQ_API_KEY and not GROQ_API_KEY.startswith("your_groq"):
    LLM_PROVIDER = "groq"
    LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "llama-3.3-70b-versatile")
elif OPENAI_API_KEY and not OPENAI_API_KEY.startswith("your_openai"):
    LLM_PROVIDER = "openai"
    LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "gpt-3.5-turbo")
else:
    LLM_PROVIDER = "mock"
    LLM_MODEL_NAME = "mock"

LLM_TEMPERATURE = 0.0

# Similarity Search Config
# Distance threshold for L2 in Chroma. Lower means more similar.
# If the lowest distance score is above this threshold, we deem confidence "low".
# NOTE: This value might need tuning depending on your documents and embedding model.
# Typically L2 distance for normalized embeddings ranges between 0 and 2.
# A threshold of 1.0 is a reasonable starting point to detect "unrelated" queries.
CONFIDENCE_THRESHOLD = 1.1

# Chunking Config
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# JWT Authentication Config
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "enterprise-ai-support-jwt-secret-key-2026-ffc")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24
