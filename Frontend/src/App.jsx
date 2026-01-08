import React, { useEffect, useState } from "react";

import Header from "./components/Header";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import LandingPage from "./components/LandingPage";
import SignupPage from "./components/SignupPage";
import ChatPage from "./components/ChatPage";
import { api } from "./utils/api";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const [inputMessage, setInputMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState("");

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  // Validate token on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      // You can add /me endpoint later if needed
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    setConversations([]);
    setActiveConversationId(null);
    setCurrentPage("home");
  };

  const onNewChat = () => {
    const newConv = {
      id: crypto.randomUUID(),
      title: "New chat",
      messages: [],
      updatedAt: new Date(),
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setInputMessage("");
    setCurrentPage("home");
  };

  const onThemeToggle = () => {
    setIsDarkMode(prev => !prev);
  };

  const onSend = async () => {
  if (!inputMessage.trim()) return;

  let conversationId = activeConversationId || "default";

  if (!activeConversationId) {
    onNewChat();
    conversationId = conversations[0]?.id || "default";
  }

  const userMessage = {
    id: Date.now(),
    type: "user",
    text: inputMessage,
  };

  setConversations(prev =>
    prev.map(c =>
      c.id === conversationId
        ? {
            ...c,
            title: c.messages.length === 0
              ? inputMessage.slice(0, 40) + (inputMessage.length > 40 ? "..." : "")
              : c.title,
            messages: [...c.messages, userMessage],
          }
        : c
    )
  );

  setInputMessage("");
  setIsLoading(true);

  try {
    const result = await api.post("/query", {
      question: inputMessage,
      thread_id: conversationId,
    });

    // Extract assistant message and citations correctly
    let assistantText = "No response received.";
    let citations = [];

    if (result.messages && Array.isArray(result.messages)) {
      const assistantMsg = result.messages.find(m => m.role === "assistant");
      if (assistantMsg) {
        assistantText = assistantMsg.content || "";
        citations = assistantMsg.metadata?.citations || [];
      }
    }

    const aiMessage = {
      id: Date.now() + 1,
      type: "ai",
      text: assistantText,
      metadata: {
        citations: citations  // ← Preserves exact backend structure
      },
      time: "1.0",
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, aiMessage] }
          : c
      )
    );

  } catch (err) {
    console.error("Query failed:", err);
    const errorMessage = {
      id: Date.now() + 1,
      type: "ai",
      text: "Sorry, something went wrong. Please try again.",
      time: "0.0",
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, errorMessage] }
          : c
      )
    );
  } finally {
    setIsLoading(false);
  }
};

  const onCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const onEditMessage = (id, text) => {
    setEditingMessageId(id);
    setEditedText(text);
  };

  const onCancelEdit = () => {
    setEditingMessageId(null);
    setEditedText("");
  };

  // Optional: implement regenerate later
  const onRegenerateResponse = () => {
    // You can expand this later
    alert("Regenerate not fully implemented yet");
  };

  const onNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <LoginPage
            onNavigate={onNavigate}
            setIsAuthenticated={setIsAuthenticated}
            setUser={setUser}
            isDarkMode={isDarkMode}
            onNewChat={onNewChat}
          />
        );
      case "signup":
        return <SignupPage onNavigate={onNavigate} isDarkMode={isDarkMode} />;
      default:
        return messages.length > 0 ? (
          <ChatPage
            messages={messages}
            isLoading={isLoading}
            inputMessage={inputMessage}
            editingMessageId={editingMessageId}
            editedText={editedText}
            copiedMessageId={copiedMessageId}
            onInputChange={setInputMessage}
            onSend={onSend}
            onEditMessage={onEditMessage}
            onEditChange={setEditedText}
            onRegenerateResponse={onRegenerateResponse}
            onCancelEdit={onCancelEdit}
            onCopyMessage={onCopyMessage}
            isDarkMode={isDarkMode}
          />
        ) : (
          <LandingPage
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onSend={onSend}
            isDarkMode={isDarkMode}
          />
        );
    }
  };

  return (
    <div className={isDarkMode ? "bg-gray-900 text-white min-h-screen" : "bg-gray-50 text-gray-900 min-h-screen"}>
      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        isDarkMode={isDarkMode}
        onNavigate={onNavigate}
      />

      <Navbar
        isAuthenticated={isAuthenticated}
        recentSearches={conversations}
        onLogout={onLogout}
        onNewChat={onNewChat}
        onThemeToggle={onThemeToggle}
        onSearchSelect={setActiveConversationId}
        isDarkMode={isDarkMode}
      />

      <div className="md:ml-64 pt-16">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;