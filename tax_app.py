from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy import text
from dotenv import load_dotenv
import bcrypt
import os
import time

from rag_core import TaxRAGAgent
from tax_database import db
from middleware import create_token, verify_token


# App & Configuration
load_dotenv()

app = FastAPI(title="Nigeria Tax RAG Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

tax_agent = TaxRAGAgent(
    chroma_dir=os.path.join(BASE_DIR, "chroma_db_agentic_tax_rag")
)

TOKEN_TIME = int(os.getenv("TOKEN_TIME", 3600))


# Models
class QueryRequest(BaseModel):
    question: str = Field(..., example="What does the Nigerian Tax Reform Bill say about VAT?")
    thread_id: Optional[str] = "default"


class RegDetails(BaseModel):
    name: str = Field(..., example="Sherif Oke")
    email: str = Field(..., example="oke@gmail.com")
    password: str = Field(..., example="ade121")
    userType: str = Field(..., example="taxpayer")
    gender: str = Field(..., example="male")


class LoginRequest(BaseModel):
    email: str = Field(..., example="sam@email.com")
    password: str = Field(..., example="sam123")



def save_chat_to_db(user_id: int, thread_id: str, question: str, answer: str, sources: list[dict]):
    """
    Save session, messages, citations, and metrics to the database.
    """
    # Create or get session
    session_query = text("""
        SELECT session_id FROM chat_sessions 
        WHERE user_id = :user_id AND title = :thread_id
    """)
    session = db.execute(session_query, {"user_id": user_id, "thread_id": thread_id}).fetchone()

    if session:
        session_id = session.session_id
        db.execute(text("""
            UPDATE chat_sessions SET last_active = CURRENT_TIMESTAMP
            WHERE session_id = :session_id
        """), {"session_id": session_id})
    else:
        insert_session = text("""
            INSERT INTO chat_sessions (user_id, title)
            VALUES (:user_id, :thread_id)
        """)
        result = db.execute(insert_session, {"user_id": user_id, "thread_id": thread_id})
        db.commit()
        session_id = result.lastrowid

    # Save user question
    user_msg = db.execute(text("""
        INSERT INTO messages (session_id, role, content)
        VALUES (:session_id, 'user', :content)
    """), {"session_id": session_id, "content": question})
    db.commit()
    user_msg_id = user_msg.lastrowid

    # Save assistant answer
    assistant_msg = db.execute(text("""
        INSERT INTO messages (session_id, role, content)
        VALUES (:session_id, 'assistant', :content)
    """), {"session_id": session_id, "content": answer})
    db.commit()
    assistant_msg_id = assistant_msg.lastrowid

    # Save citations (if any)
    for source in sources:
        db.execute(text("""
            INSERT INTO citations (message_id, source_path, page_number, document_type)
            VALUES (:message_id, :source_path, :page_number, :document_type)
        """), {
            "message_id": assistant_msg_id,
        "source_path": source["source_path"],
        "page_number": source["page_number"],
        "document_type": source["document_type"]
        })
    db.commit()

    return session_id, user_msg_id, assistant_msg_id


# Routes
@app.get("/")
def root():
    return {"message": "Welcome to Nigeria Tax RAG API"}


# AUTH 
@app.post("/signup")
def signup(input: RegDetails):
    try:
        check_query = text("""
            SELECT user_id FROM users WHERE email = :email
        """)
        existing = db.execute(check_query, {"email": input.email}).fetchone()

        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

        hashed_pw = bcrypt.hashpw(
            input.password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        insert_query = text("""
            INSERT INTO users (name, email, password, userType, gender)
            VALUES (:name, :email, :password, :userType, :gender)
        """)

        db.execute(insert_query, {
            "name": input.name,
            "email": input.email,
            "password": hashed_pw,
            "userType": input.userType,
            "gender": input.gender
        })
        db.commit()

        return {
            "message": "User created successfully",
            "data": {
                "name": input.name,
                "email": input.email,
                "userType": input.userType
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/login")
def login(input: LoginRequest):
    try:
        query = text("""
            SELECT * FROM users WHERE email = :email
        """)
        user = db.execute(query, {"email": input.email}).fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not bcrypt.checkpw(
            input.password.encode("utf-8"),
            user.password.encode("utf-8")
        ):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_token(
            details={
                "user_id": user.user_id,
                "email": user.email,
                "userType": user.userType
            },
            expiry=TOKEN_TIME
        )

        return {
            "message": "Login successful",
            "token": token,
            "userType": user.userType
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# TAX RAG
@app.post("/query")
def query_tax_agent(payload: QueryRequest, user_data=Depends(verify_token)):
    """
    Run TaxRAGAgent and save chat + citations + metrics.
    """
    user_id = user_data["user_id"]
    start_time = time.time()

    try:
        # Run RAG agent
        result = tax_agent.run_with_memory(
            payload.question,
            payload.thread_id
        )

        # Extract structured response
        messages = result.get("messages", [])

        assistant_content = ""
        citations = []

        for msg in messages:
            # Assistant message
            if msg["role"] == "assistant":
                assistant_content = msg["content"]
                citations = msg.get("metadata", {}).get("citations", [])

        # Save session + messages + citations
        save_chat_to_db(
            user_id=user_id,
            thread_id=payload.thread_id,
            question=payload.question,
            answer=assistant_content,
            sources=citations
        )

        # Save query metrics
        duration_ms = int((time.time() - start_time) * 1000)

        db.execute(text("""
            INSERT INTO query_logs (user_id, question, retrieved_docs, response_time_ms)
            VALUES (:user_id, :question, :retrieved_docs, :response_time_ms)
        """), {
            "user_id": user_id,
            "question": payload.question,
            "retrieved_docs": len(citations),
            "response_time_ms": duration_ms
        })
        db.commit()

        # Return response to frontend
        # return result
        return {
            "results": assistant_content,
            "citations": citations
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/session/{thread_id}")
def get_session(thread_id: str, user_data=Depends(verify_token)):
    return {
        "thread_id": thread_id,
        "messages": tax_agent.get_session(thread_id)
    }


@app.post("/reset/{thread_id}")
def reset_session(thread_id: str, user_data=Depends(verify_token)):
    tax_agent.reset_session(thread_id)
    return {"status": f"Session '{thread_id}' reset successfully"}


# DEBUG
@app.get("/debug/retrieval")
def debug_retrieval(user_data=Depends(verify_token)):
    retriever = tax_agent.vectorstore.as_retriever(search_kwargs={"k": 3})
    docs = retriever.invoke("Nigerian Tax Reform Bills")

    return {
        "count": len(docs),
        "samples": [
            {
                "type": d.metadata.get("type"),
                "page": d.metadata.get("page"),
                "source": d.metadata.get("source_path"),
                "text": d.page_content[:300]
            }
            for d in docs
        ]
    }

# To run the app, use the command:
# cd /c:/Users/USER/Desktop/Nig_Tax_Rag/nigeria_tax_rag/Backend
# uvicorn tax_app:app --reload