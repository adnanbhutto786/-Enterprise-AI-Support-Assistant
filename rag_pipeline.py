import os
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_classic.memory import ConversationBufferMemory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.embeddings import Embeddings

from config import (
    CHROMA_PERSIST_DIR,
    EMBEDDING_MODEL_NAME,
    LLM_MODEL_NAME,
    LLM_TEMPERATURE,
    CONFIDENCE_THRESHOLD,
    OPENAI_API_KEY,
    GROQ_API_KEY,
    LLM_PROVIDER
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


class EnterpriseRAGPipeline:
    def __init__(self):
        self.is_mock = False
        self._vectorstore = None
        self._embeddings = None
        self.llm = None
        
        # 1. Initialize LLM (Groq or OpenAI)
        try:
            if GROQ_API_KEY and not GROQ_API_KEY.startswith("your_groq"):
                model = LLM_MODEL_NAME if LLM_MODEL_NAME != "mock" else "llama-3.3-70b-versatile"
                self.llm = ChatOpenAI(
                    base_url="https://api.groq.com/openai/v1",
                    api_key=GROQ_API_KEY,
                    model=model,
                    temperature=LLM_TEMPERATURE
                )
                print(f"RAG Pipeline initialized with Groq LLM ({model}).")
            elif OPENAI_API_KEY and not OPENAI_API_KEY.startswith("your_openai"):
                self.llm = ChatOpenAI(
                    model_name=LLM_MODEL_NAME,
                    temperature=LLM_TEMPERATURE
                )
                print(f"RAG Pipeline initialized with OpenAI LLM ({LLM_MODEL_NAME}).")
            else:
                print("No active Groq or OpenAI key found. Falling back to mock mode.")
                self.is_mock = True
        except Exception as e:
            print(f"RAG LLM initialization failed, falling back to mock: {e}")
            self.is_mock = True

        # 2. Initialize Conversation Memory
        self.memory = ConversationBufferMemory(
            return_messages=True,
            memory_key="chat_history",
            input_key="question"
        )

        # 3. Define Prompt Template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an Enterprise AI Support Assistant for company employees.
You assist with enterprise ERP systems (SAP FI/CO, MM, SD, PM, Basis), IT Support, and operational workflows.

Instructions:
1. If relevant company document context is provided below, prioritize it and base your answer accurately on it.
2. If company context is not provided or insufficient, provide standard enterprise best-practice troubleshooting steps clearly and concisely.
3. Keep instructions step-by-step (Transaction codes, menu paths, common causes, and resolution steps).
4. Be professional, helpful, and concise.

Company Document Context:
{context}"""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}")
        ])

    @property
    def vectorstore(self):
        """Lazy load vectorstore and embeddings when needed."""
        if self._vectorstore is None and os.path.exists(CHROMA_PERSIST_DIR):
            try:
                if OPENAI_API_KEY and not OPENAI_API_KEY.startswith("your_openai"):
                    self._embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL_NAME)
                else:
                    self._embeddings = LocalDefaultEmbeddings()
                    
                self._vectorstore = Chroma(
                    persist_directory=CHROMA_PERSIST_DIR,
                    embedding_function=self._embeddings
                )
            except Exception as e:
                print(f"Vector Store lazy load notice: {e}")
                self._vectorstore = None
        return self._vectorstore

    def retrieve_with_confidence(self, query: str, k: int = 4):
        """
        Perform similarity search and return documents with their distance scores.
        Chroma uses L2 distance by default (lower is better).
        """
        if not self.vectorstore:
            return []
        try:
            return self.vectorstore.similarity_search_with_score(query, k=k)
        except Exception as e:
            print(f"Vector retrieval error: {e}")
            return []

    def format_docs(self, docs):
        """Format documents for the LLM context."""
        return "\n\n".join(doc.page_content for doc in docs)

    def generate_citations(self, docs):
        """Generate a citation string from document metadata."""
        citations = []
        for doc in docs:
            source = doc.metadata.get("source", "Company Document")
            page = doc.metadata.get("page", "")
            citation = f"- {os.path.basename(source)}"
            if page:
                citation += f" (Page {page})"
            if citation not in citations:
                citations.append(citation)
        return "\n".join(citations)

    def ask(self, question: str) -> dict:
        """
        Main method to ask a question to the RAG pipeline.
        Returns a dictionary with 'answer', 'confidence_low', and 'citations'.
        """
        if self.is_mock or not self.llm:
            return self.generate_mock_ask_response(question)

        try:
            # Step 1: Retrieve documents if vector store is available
            search_results = self.retrieve_with_confidence(question)
            
            context = "No specific uploaded document matched. Answering using enterprise knowledge base."
            citations = ""
            confidence_low = False

            if search_results:
                best_doc, best_score = search_results[0]
                
                # Check if distance is reasonably close
                if best_score <= CONFIDENCE_THRESHOLD:
                    docs = [doc for doc, score in search_results]
                    context = self.format_docs(docs)
                    citations = self.generate_citations(docs)
                else:
                    # Low confidence on matching documents
                    confidence_low = True

            # Step 2: Prepare inputs for LLM including memory
            chat_history = self.memory.load_memory_variables({})["chat_history"]
            
            chain = self.prompt | self.llm | StrOutputParser()
            
            # Step 3: Generate answer
            answer = chain.invoke({
                "context": context,
                "chat_history": chat_history,
                "question": question
            })

            # Step 4: Save to memory
            self.memory.save_context({"question": question}, {"answer": answer})

            return {
                "answer": answer,
                "confidence_low": confidence_low,
                "citations": citations
            }
        except Exception as e:
            print(f"RAG ask call failed, falling back to mock: {e}")
            return self.generate_mock_ask_response(question)

    def generate_mock_ask_response(self, question: str) -> dict:
        """Generates smart mock answers for SAP support questions."""
        q = question.lower()
        
        # Simulated responses based on typical SAP modules
        if "fi" in q or "posting" in q or "f5080" in q:
            answer = (
                "SAP FI Document Posting Error F5080 typically occurs when the document type "
                "you are trying to post (e.g., 'SA') is not defined or mapped for the posting key/transaction.\n\n"
                "**Resolution Steps:**\n"
                "1. Go to transaction code **OBA7**.\n"
                "2. Check if the Document Type 'SA' exists.\n"
                "3. Ensure the number range is correctly assigned to 'SA'.\n"
                "4. Save and retry the posting."
            )
            citations = "- SAP_FI_Posting_Guide_v2.pdf (Page 14)\n- SAP_Configuration_Manual.pdf (Page 89)"
            confidence_low = False
        elif "mm" in q or "purchase" in q or "strategy" in q or "po" in q or "me013" in q:
            answer = (
                "The SAP MM Purchase Order release strategy block (Error ME013) is active because the PO details "
                "(like total net value or purchasing group) do not match any release strategy configuration or need approval.\n\n"
                "**Resolution Steps:**\n"
                "1. Check the PO release strategy in transaction **ME23N** under the 'Release Strategy' tab.\n"
                "2. Verify if the workflow assignee is active.\n"
                "3. If the release strategy is stuck, run **OMGS** to check strategy configuration settings."
            )
            citations = "- Material_Management_Process_Flow.pdf (Page 45)\n- SAP_MM_Logistics_Support.pdf"
            confidence_low = False
        elif "basis" in q or "password" in q or "reset" in q:
            answer = (
                "To reset a user password or unlock an account in SAP Basis:\n\n"
                "**Resolution Steps:**\n"
                "1. Log in to the SAP system with administrative credentials.\n"
                "2. Execute transaction code **SU01**.\n"
                "3. Input the user's username and click on the 'Edit' (pencil) icon.\n"
                "4. Go to the 'Logon Data' tab, type a new initial password, and save.\n"
                "5. Alternatively, click the 'Unlock' icon (lock/unlock) on the toolbar to release USR02 locks."
            )
            citations = "- Basis_Administration_Handbook.pdf (Page 5)\n- IT_Support_SOP_User_Provisioning.pdf"
            confidence_low = False
        elif "sd" in q or "pricing" in q or "condition" in q or "v1002" in q:
            answer = (
                "SAP SD Billing & Pricing Error V1002 occurs when the pricing engine cannot find a valid "
                "condition record for the pricing conditions in the sales order.\n\n"
                "**Resolution Steps:**\n"
                "1. Identify the missing condition type (e.g., PR00).\n"
                "2. Open transaction **VK11** (Create Condition Record) or **VK12** (Change Condition Record).\n"
                "3. Create a valid condition record for the material and customer combination."
            )
            citations = "- Sales_and_Distribution_Pricing_Guide.pdf (Page 31)"
            confidence_low = False
        else:
            # Low confidence response -> triggers escalation ticket
            answer = (
                "I could not find a clear match for your query in the SAP knowledge base. "
                "This query will be escalated to our human support experts."
            )
            citations = ""
            confidence_low = True
            
        return {
            "answer": answer,
            "confidence_low": confidence_low,
            "citations": citations
        }
