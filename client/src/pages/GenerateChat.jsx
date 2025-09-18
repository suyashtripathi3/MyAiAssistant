import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiCopy, FiEdit, FiSend, FiMenu, FiX, FiPlus } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

function GenerateChat() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([
    { id: Date.now(), title: "New Chat" || prompt, messages: [] },
  ]);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const activeChat = chats.find((c) => c.id === activeChatId);
    if (activeChat) {
      setMessages(activeChat.messages);
    }
  }, [activeChatId]);

  const saveMessagesToChat = (updatedMessages) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, messages: updatedMessages } : c
      )
    );
  };

  const streamAIResponse = (fullText, indexToReplace = null) => {
    let index = 0;
    const words = fullText.split(" ");

    if (indexToReplace !== null) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[indexToReplace] = { sender: "ai", text: "" };
        saveMessagesToChat(updated);
        return updated;
      });
    } else {
      setMessages((prev) => {
        const updated = [...prev, { sender: "ai", text: "" }];
        saveMessagesToChat(updated);
        return updated;
      });
    }

    const interval = setInterval(() => {
      index++;
      setMessages((prev) => {
        const updated = [...prev];
        const targetIndex =
          indexToReplace !== null ? indexToReplace : updated.length - 1;
        updated[targetIndex].text = words.slice(0, index).join(" ");
        saveMessagesToChat(updated);
        return updated;
      });
      if (index === words.length) clearInterval(interval);
    }, 25);
  };

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    if (editingIndex !== null) {
      try {
        setLoading(true);
        const res = await axios.post("http://localhost:8080/api/gemini/text", {
          prompt: prompt,
        });
        streamAIResponse(res.data.text, editingIndex + 1);
      } catch (err) {
        console.error(err);
      } finally {
        setEditingIndex(null);
        setPrompt("");
        setLoading(false);
      }
      return;
    }

    setMessages((prev) => {
      const updated = [...prev, { sender: "user", text: prompt }];
      saveMessagesToChat(updated);
      return updated;
    });
    setLoading(true);
    setPrompt("");

    try {
      const res = await axios.post("http://localhost:8080/api/gemini/text", {
        prompt: prompt,
      });
      streamAIResponse(res.data.text);
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [
          ...prev,
          { sender: "ai", text: "Something went wrong!" },
        ];
        saveMessagesToChat(updated);
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendPrompt();
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  const editMessage = (text, index) => {
    setPrompt(text);
    setEditingIndex(index);
  };

  const renderMessage = (msg) => {
    if (msg.sender === "ai") {
      const parts = msg.text.split("```");
      return parts.map((part, i) =>
        i % 2 === 1 ? (
          <div key={i} className="relative group my-2">
            <SyntaxHighlighter
              language="javascript"
              style={oneDark}
              customStyle={{
                borderRadius: "10px",
                padding: "14px",
                fontSize: "1rem",
                marginTop: "6px",
              }}
            >
              {part.trim()}
            </SyntaxHighlighter>
            <FiCopy
              className="absolute top-2 right-2 text-gray-300 cursor-pointer opacity-70 group-hover:opacity-100"
              size={16}
              onClick={() => copyMessage(part.trim())}
            />
          </div>
        ) : (
          part && (
            <p
              key={i}
              className="text-gray-200 text-[18px] leading-relaxed mb-1"
            >
              {part}
            </p>
          )
        )
      );
    }
    return <p className="text-white text-[17px]">{msg.text}</p>;
  };

  const newChat = () => {
    const chat = { id: Date.now(), title: "New Chat", messages: [] };
    setChats((prev) => [...prev, chat]);
    setActiveChatId(chat.id);
    setMessages([]);
  };

  return (
    <div className="w-screen h-screen flex bg-[#212121] text-white">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#2c2c2c] w-64 p-4 transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Chats</h2>
          <FiX
            className="cursor-pointer"
            size={20}
            onClick={() => setSidebarOpen(false)}
          />
        </div>
        <button
          onClick={newChat}
          className="flex items-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md mb-4"
        >
          <FiPlus /> New Chat
        </button>
        <div className="flex flex-col gap-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`p-2 rounded-md cursor-pointer ${
                chat.id === activeChatId
                  ? "bg-[#40414f] font-semibold"
                  : "hover:bg-[#333]"
              }`}
            >
              {chat.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Transparent Navbar */}
        <span className="text-center font-semibold text-2xl p-2">
          YAI-Your AI
        </span>
        <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 bg-transparent z-40">
          <FiMenu
            className="cursor-pointer text-white"
            size={22}
            onClick={() => setSidebarOpen(true)}
          />
          <span className="text-gray-300 text-sm mr-2">AI Assistant</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto px-4 py-16 gap-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`w-full flex ${
                msg.sender === "user" ? "justify-end" : "justify-center"
              }`}
            >
              <div className="relative max-w-[70%] break-words px-4 py-2">
                <div className="whitespace-pre-line">{renderMessage(msg)}</div>
                <div className="flex gap-2 mt-2 text-gray-300 opacity-60 hover:opacity-100 transition-opacity">
                  {msg.sender === "user" && (
                    <FiEdit
                      className="cursor-pointer"
                      size={16}
                      onClick={() => editMessage(msg.text, idx)}
                    />
                  )}
                  <FiCopy
                    className="cursor-pointer"
                    size={16}
                    onClick={() => copyMessage(msg.text)}
                  />
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-400 italic text-sm">AI is typing...</div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#212121]">
          <div className="flex items-center bg-[#40414f] rounded-full px-3 py-2 shadow-md max-w-2xl mx-auto w-full">
            <input
              type="text"
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-2 text-md"
              placeholder="Type your message..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={sendPrompt}
              className="ml-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-all"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateChat;
