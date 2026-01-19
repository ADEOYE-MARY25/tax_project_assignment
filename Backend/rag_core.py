# # Agentic RAG brain

# # Retrieval

# # Authority hierarchy

# # Answer generation

# # Multilingual output

# rag.py - Nigeria Tax RAG Agent with Multilingual Support

import os
import json
from typing import Literal
from dotenv import load_dotenv

from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool

# Load environment variables
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not set")


class TaxRAGAgent:
    def __init__(self, chroma_dir: str):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.4,
            api_key=api_key
        )

        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=api_key
        )

        self.vectorstore = Chroma(
            collection_name="Tax_agentic_rag_docs",
            persist_directory=chroma_dir,
            embedding_function=self.embeddings
        )

        # Session memory for frontend history
        self.sessions = {}  # thread_id -> list of messages

        # Tools and graph
        self.tools = self._build_tools()
        self.graph = self._build_graph()

    # --------------------------------------------------
    # TOOLS
    # --------------------------------------------------
    def _build_tools(self):
        @tool
        def retrieve_documents(query: str) -> dict:
            """
#     Search for relevant documents in the knowledge base.
    
#     Use this tool when you need information from the document collection
#     to answer the user's question. Do NOT use this for:
#     - General knowledge questions
#     - Greetings or small talk
#     - Simple calculations

#     When a tool returns content:
#     - Use ONLY tool.content in your final answer
#     - Do NOT repeat citations inside the content
#     - Citations will be handled separately

    
#     Args:
#         query: The search query describing what information is needed
        
#     Returns:
#         Relevant document excerpts that can help answer the question
#     """
            retriever = self.vectorstore.as_retriever(
                search_type="mmr",
                search_kwargs={"k": 5, "fetch_k": 10}
            )
            results = retriever.invoke(query)
            if not results:
                return {"content": "No documents found", "citations": []}

            return {
                "content": "\n\n".join(d.page_content for d in results),
                "citations": [
                    {
                        "source_path": d.metadata.get("source_path"),
                        "page_number": d.metadata.get("page"),
                        "document_type": d.metadata.get("type"),
                        "creation_date": d.metadata.get("creation_date"),
                    }
                    for d in results
                ]
            }

        @tool
        def retrieve_by_authority(query: str) -> dict:
            """
#     Retrieve documents prioritizing legal authority hierarchy.

#     Use this tool when:
#     - Legal accuracy is critical
#     - Conflicting interpretations may exist
#     - You need authoritative sources (Acts, Bills)

#     Do NOT use this for:
#     - Greetings or small talk
#     - General knowledge questions

#     When a tool returns content:
#     - Use ONLY tool.content in your final answer
#     - Do NOT repeat citations inside the content
#     - Citations will be handled separately

#     Args:
#         query: Legal or tax-related query requiring authoritative sources

#     Returns:
#         Document excerpts ordered by legal authority
#     """
            retriever = self.vectorstore.as_retriever(
                search_kwargs={
                    "k": 5,
                    "filter": {
                        "$or": [
                            {"type": "acts"},
                            {"type": "bills"},
                            {"type": "executive_guidance"},
                            {"type": "analysis"}
                        ]
                    }
                }
            )
            results = retriever.invoke(query)
            if not results:
                return {"content": "No authoritative documents found.", "citations": []}

            return {
                "content": "\n\n".join(d.page_content for d in results),
                "citations": [
                    {
                        "source_path": d.metadata.get("source_path"),
                        "page_number": d.metadata.get("page"),
                        "document_type": d.metadata.get("type"),
                        "creation_date": d.metadata.get("creation_date"),
                    }
                    for d in results
                ]
            }

        @tool
        def retrieve_recent_documents(query: str, k: int = 5) -> dict:
            """
#     Retrieve the most recent documents relevant to a tax or legal query.

#     Use this tool when:
#     - The question relates to recent tax reforms
#     - Timeliness matters (new bills, amendments, reforms)

#     Do NOT use this for:
#     - Historical-only analysis
#     - Casual conversation

#     When a tool returns content:
#     - Use ONLY tool.content in your final answer
#     - Do NOT repeat citations inside the content
#     - Citations will be handled separately

#     Args:
#         query: Query needing up-to-date legal or tax information

#     Returns:
#         Recent document excerpts with creation dates
#     """
            
            retriever = self.vectorstore.as_retriever(search_kwargs={"k": 15})
            results = retriever.invoke(query)
            if not results:
                return {"content": "No recent documents found", "citations": []}
            docs = sorted(results, key=lambda d: d.metadata.get("creation_date", ""), reverse=True)[:k]
            return {
                "content": "\n\n".join(d.page_content for d in docs),
                "citations": [
                    {
                        "source_path": d.metadata.get("source_path"),
                        "page_number": d.metadata.get("page"),
                        "document_type": d.metadata.get("type"),
                        "creation_date": d.metadata.get("creation_date"),
                    }
                    for d in docs
                ]
            }

        @tool
        def retrieve_definitions(term: str, k: int = 5) -> dict:
            """
#     Retrieve clear definitions or explanations of tax and legal terms.

#     Use this tool when:
#     - The user asks "What is...", "Define...", or "Explain..."
#     - Clarification of tax concepts is needed

#     Do NOT use this for:
#     - Opinions or policy arguments
#     - Simple chit-chat

#     When a tool returns content:
#     - Use ONLY tool.content in your final answer
#     - Do NOT repeat citations inside the content
#     - Citations will be handled separately

#     Args:
#         query: Term or concept needing definition

#     Returns:
#         Document excerpts explaining the concept
#     """
            query = f"Definition of {term}"
            retriever = self.vectorstore.as_retriever(search_kwargs={"k": k})
            results = retriever.invoke(query)
            if not results:
                return {"content": f"No definitions found for '{term}'.", "citations": []}
            return {
                "content": "\n\n".join(d.page_content for d in results),
                "citations": [
                    {
                        "source_path": d.metadata.get("source_path"),
                        "page_number": d.metadata.get("page"),
                        "document_type": d.metadata.get("type"),
                        "creation_date": d.metadata.get("creation_date"),
                    }
                    for d in results
                ]
            }

        @tool
        def multilingual_output_node(text: str, target_language: str = "all") -> str:
            """Generate multilingual summaries. Use target_language to request specific language."""
            languages = {
                "all": ["ENGLISH", "PIDGIN", "YORUBA", "HAUSA", "IGBO"],
                "yoruba": ["ENGLISH", "YORUBA"],
                "pidgin": ["ENGLISH", "PIDGIN"],
                "hausa": ["ENGLISH", "HAUSA"],
                "igbo": ["ENGLISH", "IGBO"],
            }

            requested = languages.get(target_language.lower(), languages["all"])
            included_langs = ", ".join(requested[1:]) if len(requested) > 1 else "none"

            lang_instructions = "\n".join([
                "1. Keep the English version unchanged and accurate.",
                f"2. Provide SHORT, natural summaries in: {included_langs}" if included_langs != "none" else "2. Only return the English version.",
                "3. Do NOT add, remove, or alter any legal facts.",
                "4. Keep summaries accessible and clear."
            ])

            output_format = "\n\n".join([f"{lang}:\n<summary>" for lang in requested])

            prompt = f"""
You are a multilingual legal summarizer for Nigerian tax information.

Text:
{text}

Instructions:
{lang_instructions}

Output format exactly:

{output_format}
"""
            response = self.llm.invoke(prompt)
            return response.content.strip()

        return [
            retrieve_documents,
            retrieve_by_authority,
            retrieve_recent_documents,
            retrieve_definitions,
            multilingual_output_node
        ]

    # --------------------------------------------------
    # AGENT LOGIC
    # --------------------------------------------------
    def _assistant(self, state: MessagesState):
        system_prompt = SystemMessage(content="""
You are an expert Nigerian tax assistant powered by official tax documents. Your answers must be:

- Clear, concise, and easy to understand for non-experts
- Strictly based ONLY on the content retrieved from tools
- Never longer than necessary (aim for 4–8 sentences maximum)
- Written in professional but simple language

MANDATORY WORKFLOW:
1. For ANY question about tax laws, reforms, bills, VAT, personal income tax, definitions, rates, exemptions, or procedures → ALWAYS call a retrieval tool FIRST.
2. NEVER answer from pre-trained general knowledge.
3. If no relevant documents are found, respond: "I couldn't find specific information on this in the current tax documents."

ANSWER STYLE RULES:
- Start with a short, direct definition or explanation when the question is "What is..." or similar.
- Use bullet points to list key features, sources of income, rules, or requirements.
- Summarize and rephrase — NEVER copy large sections of legal text verbatim.
- Do NOT mention document names, file paths, page numbers, or say "according to section X" — citations are attached separately.
- Do NOT say "Based on the retrieved documents" or similar — just give the answer naturally.

EXAMPLES OF GOOD RESPONSES:
Question: "What is personal income tax?"
→ "Personal Income Tax (PIT) in Nigeria is a tax on the earnings of individuals. It applies to income from employment, business, rents, pensions, and investments. The tax is charged on income earned in or brought into Nigeria, with rates applied progressively after deductions and reliefs."

Question: "Who pays VAT in Nigeria?"
→ "Value Added Tax (VAT) is charged on the supply of taxable goods and services in Nigeria. It is ultimately borne by the final consumer, but businesses registered for VAT collect and remit it to the government."

RETRIEVAL RULES:
- Retrieve for: definitions, tax types, rules, reforms, obligations, exemptions, rates
- Do NOT retrieve for: greetings ("hi", "hello"), thanks, casual chat, questions about your capabilities

If multiple tools return content, synthesize the most relevant and authoritative information (prefer Acts > Bills > Official Guidance).

Your final answer must always be derived exclusively from tool-retrieved content.
""")

        messages = [system_prompt] + state["messages"]
        response = self.llm.bind_tools(self.tools, tool_choice="auto").invoke(messages)
        return {"messages": state["messages"] + [response]}

    def _should_continue(self, state: MessagesState) -> Literal["tools", "__end__"]:
        last = state["messages"][-1]
        return "tools" if last.tool_calls else "__end__"

    # --------------------------------------------------
    # GRAPH WITH MULTILINGUAL FINAL STEP
    # --------------------------------------------------
    def _build_graph(self):
        builder = StateGraph(MessagesState)

        builder.add_node("assistant", self._assistant)
        builder.add_node("tools", ToolNode(self.tools))

        # Final multilingual node
        def multilingual_node(state: MessagesState):
    # Get user's original question
            user_question = ""
            for msg in state["messages"]:
                if isinstance(msg, HumanMessage):
                    user_question = msg.content.lower()
                    break

            # Check if user requested translation in any language
            translation_requested = any(word in user_question for word in [
                "yoruba", "pidgin", "hausa", "igbo",
                "translate", "in yoruba", "in pidgin", "in hausa", "in igbo",
                "pidgin english", "na pidgin", "hausa version", "igbo version"
            ])

            # Get final English answer
            final_english = ""
            for msg in reversed(state["messages"]):
                if isinstance(msg, AIMessage) and not msg.tool_calls:
                    final_english = msg.content.strip()
                    break

            if not final_english:
                return {"messages": state["messages"]}

            # Only generate multilingual if user asked for it
            if translation_requested:
                multilingual_tool = next((t for t in self.tools if t.name == "multilingual_output_node"), None)
                if multilingual_tool:
                    result = multilingual_tool.invoke({
                        "text": final_english,
                        "target_language": "all"  # or detect specific language if needed
                    })
                    multilingual_message = AIMessage(content=result)
                    return {"messages": state["messages"] + [multilingual_message]}

            # Default: just return English answer
            return {"messages": state["messages"] + [AIMessage(content=final_english)]}

        builder.add_node("multilingual", multilingual_node)

        # Edges
        builder.add_edge(START, "assistant")
        builder.add_conditional_edges(
            "assistant",
            self._should_continue,
            {"tools": "tools", "__end__": "multilingual"}
        )
        builder.add_edge("tools", "assistant")
        builder.add_edge("multilingual", END)

        return builder.compile(checkpointer=MemorySaver())

    # --------------------------------------------------
    # PUBLIC METHODS
    # --------------------------------------------------
    def run_with_memory(self, question: str, thread_id: str = "default"):
        if thread_id not in self.sessions:
            self.sessions[thread_id] = []

        user_entry = {"role": "user", "content": question}
        self.sessions[thread_id].append(user_entry)

        try:
            result = self.graph.invoke(
                {"messages": [HumanMessage(content=question)]},
                config={"configurable": {"thread_id": thread_id}}
            )
        except Exception as e:
            print(f"Graph invoke error: {e}")
            final_content = "Sorry, an error occurred while processing your question."
            citations = []
        else:
            final_content = "No response generated."
            citations = []

            # Extract final multilingual message
            for msg in result["messages"]:
                if isinstance(msg, AIMessage) and not msg.tool_calls:
                    final_content = msg.content.strip()

                if isinstance(msg, ToolMessage):
                    try:
                        tool_out = json.loads(msg.content)
                        if isinstance(tool_out, dict) and "citations" in tool_out:
                            citations.extend(tool_out["citations"])
                    except:
                        pass

            # Deduplicate citations
            seen = set()
            unique_citations = []
            for c in citations:
                key = (c["source_path"], c.get("page_number"))
                if key not in seen:
                    seen.add(key)
                    unique_citations.append(c)
            citations = unique_citations

        assistant_entry = {
            "role": "assistant",
            "content": final_content,
            "metadata": {
                "citations": citations
            }
        }

        self.sessions[thread_id].append(assistant_entry)

        return {
            "messages": [
                {"role": "user", "content": question},
                assistant_entry
            ]
        }

    def get_session(self, thread_id: str):
        return self.sessions.get(thread_id, [])

    def reset_session(self, thread_id: str):
        if thread_id in self.sessions:
            self.sessions[thread_id] = []