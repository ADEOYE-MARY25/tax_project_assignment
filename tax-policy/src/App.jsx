import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import LandingPage from "./components/LandingPage";
import SignupPage from "./components/SignUpPage";
import ChatPage from "./components/ChatPage";
import { api } from "./utils/api";
function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  // const [recentSearches, setRecentSearches] = useState([]);
  const [conversations, setConversations] = useState([]);
/*
  conversations = [
    {
      id: string,
      title: string,
      messages: [],
      updatedAt: Date
    }
  ]
*/

const [activeConversationId, setActiveConversationId] = useState(null);

  const [inputMessage, setInputMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
// const [messages, setMessages] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [loadingTime, setLoadingTime] = useState(0);
const [copiedMessageId, setCopiedMessageId] = useState(null);
const [editingMessageId, setEditingMessageId] = useState(null);
const [editedText, setEditedText] = useState("");
const [regeneratingAiId, setRegeneratingAiId] = useState(null);
const activeConversation = conversations.find(
  c => c.id === activeConversationId
);

const messages = activeConversation?.messages || [];

const onLogout = () => {
  localStorage.removeItem("token");
  setIsAuthenticated(false);
  setUser(null);
  setConversations([]);
  setActiveConversationId(null);
  setCurrentPage("home");
};



useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  api.get("/me")
    .then((res) => {
      setIsAuthenticated(true);
      setUser({ email: res.email });
    })
    .catch(() => {
      localStorage.removeItem("token");
    });
}, []);

 const onNewChat = () => {
  if (!isAuthenticated) {
    setConversations([]);
    setActiveConversationId(null);
    setInputMessage("");
    return;
  }

  // save current chat if it has messages
  if (activeConversation?.messages.length > 0) {
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? { ...c, updatedAt: new Date() }
          : c
      )
    );
  }

  const newConversation = {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [],
    updatedAt: new Date(),
  };

  setConversations(prev => [newConversation, ...prev]);
  setActiveConversationId(newConversation.id);
  setInputMessage("");
};

  const onThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const onSearchSelect = (search) => {
    setInputMessage(search);
    setCurrentPage("home");
  };

const onSend = async () => {
  if (!inputMessage.trim()) return;

  let conversationId = activeConversationId;

  // 1️⃣ Create a new conversation if none exists
  if (!conversationId) {
    const newConversation = {
      id: crypto.randomUUID(),
      title: "New chat",
      messages: [],
      updatedAt: new Date(),
    };

    setConversations([newConversation]);
    setActiveConversationId(newConversation.id);
    conversationId = newConversation.id;
  }

  const userMessage = {
    id: Date.now(),
    type: "user",
    text: inputMessage,
  };

  setInputMessage("");
  setIsLoading(true);

  // 2️⃣ Append USER message & update title if it's the first message
  setConversations((prev) =>
    prev.map((c) => {
      if (c.id !== conversationId) return c;

      const shouldUpdateTitle =
        c.title === "New chat" && c.messages.length === 0;

      return {
        ...c,
        title: shouldUpdateTitle
          ? userMessage.text.replace(/\n/g, " ").slice(0, 30)
          : c.title,
        messages: [...c.messages, userMessage],
        updatedAt: new Date(),
      };
    })
  );

  const start = performance.now();

  try {
    // 3️⃣ Call backend
    const res = await api.post("/generate", {
      prompt: userMessage.text,
    });

    const end = performance.now();

    // 4️⃣ Append AI message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: Date.now() + 1,
                  type: "ai",
                  text: res.text,
                  time: ((end - start) / 1000).toFixed(2),
                },
              ],
              updatedAt: new Date(),
            }
          : c
      )
    );
  } catch (err) {
    // 5️⃣ Error fallback
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: Date.now() + 1,
                  type: "ai",
                  text: "Something went wrong. Please try again.",
                  time: "0.0",
                },
              ],
            }
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

  const aiMessage = messages.find(
    (m, i) => m.type === "ai" && messages[i - 1]?.id === id
  );

  setRegeneratingAiId(aiMessage?.id || null);
  setEditedText(text);
};


const onCancelEdit = () => {
  setEditingMessageId(null);
  setEditedText("");
};

const onRegenerateResponse = async () => {
  setEditingMessageId(null);
  setIsLoading(true);

  try {
    const res = await api.post("/generate", {
      prompt: editedText,
    });

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === regeneratingAiId
          ? {
              ...msg,
              text: res.text,
              time: "1.0",
            }
          : msg
      )
    );
  } finally {
    setIsLoading(false);
    setRegeneratingAiId(null);
    setEditedText("");
  }
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
          />
        );
      case "signup":
        return (
          <SignupPage
            onNavigate={onNavigate}
            setIsAuthenticated={setIsAuthenticated}
            setUser={setUser}
            isDarkMode={isDarkMode}
          />
        );
      default:
  return messages.length > 0 ? (
    <ChatPage
      messages={messages}
      isLoading={isLoading}
      loadingTime={loadingTime}
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
    <div className={isDarkMode ? 'bg-gray-900 text-white min-h-screen' : 'bg-white text-gray-900 min-h-screen'}>
      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        isDarkMode={isDarkMode}
        onNavigate={onNavigate}
      />

   <Navbar
  isAuthenticated={isAuthenticated}
  recentSearches={conversations}   // ✅ conversations replaces recentSearches
  onLogout={onLogout}
  onNewChat={onNewChat}
  onThemeToggle={onThemeToggle}
  onSearchSelect={setActiveConversationId}
  isDarkMode={isDarkMode}
/>


      <div className="md:ml-64">
        {renderPage()}
      </div>
    </div>
  );
}
export default App
