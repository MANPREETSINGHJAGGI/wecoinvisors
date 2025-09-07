"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Call AI API (Backend Proxy)
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      const data = await res.json();
      const aiResponse = data.answer || "Sorry, I couldn't understand that.";

      setMessages([...newMessages, { sender: "ai", text: aiResponse }]);
    } catch (error) {
      console.error("Chat API Error:", error);
      setMessages([...newMessages, { sender: "ai", text: "Error fetching response." }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4 flex flex-col h-[600px]">
      {/* Header */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">AI Stock Assistant</h2>

      {/* Chat Box */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">Ask me anything about stocks, sectors, or news!</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg max-w-[80%] ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-200 text-gray-800 self-start"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
        {loading && <p className="text-gray-400 italic">Thinking...</p>}
      </div>

      {/* Input */}
      <div className="mt-4 flex">
        <input
          type="text"
          className="flex-1 border rounded-lg p-2 text-gray-700"
          placeholder="Ask about stocks..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatAssistant;
