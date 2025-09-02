import React, { useState, useRef, useEffect } from "react";
import { Send, Car, Bot, User, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là AI VinFast chuyên tư vấn bán xe. Tôi có thể giúp bạn tìm hiểu về các dòng xe, giá cả, và thông tin chi tiết. Bạn đang quan tâm đến loại xe nào?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gửi tin nhắn tới backend
 const handleSendMessage = async () => {
  if (!inputText.trim()) return;

  const newUserMessage: Message = {
    id: Date.now().toString(),
    text: inputText,
    isUser: true,
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, newUserMessage]);
  setInputText("");
  setIsTyping(true);

  try {
    const token = localStorage.getItem("token"); // lấy JWT đã lưu
    if (!token) throw new Error("Bạn cần đăng nhập để chat");

    const response = await fetch("http://localhost:3000/api/chatai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // gửi token
      },
      body: JSON.stringify({
        message: inputText,
      }),
    });

    if (!response.ok) {
      throw new Error(`API trả về lỗi ${response.status}`);
    }

    const data = await response.json();

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: data.reply || "Xin lỗi, tôi không có phản hồi.",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
  } catch (error) {
    console.error("Lỗi gọi API:", error);

    const errorMsg: Message = {
      id: (Date.now() + 2).toString(),
      text: "⚠️ Xin lỗi, hiện tại không kết nối được với máy chủ.",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setIsTyping(false);
  }
};

const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto px-4 py-6 h-screen flex flex-col max-w-4xl">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl mb-6 p-6 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                AutoChat AI
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </h1>
              <p className="text-gray-600">
                Tư vấn chuyên nghiệp về mua bán xe hơi
              </p>
            </div>
            <div className="ml-auto">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Đang hoạt động
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 animate-fade-in ${
                  message.isUser ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    message.isUser
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600"
                  }`}
                >
                  {message.isUser ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg ${
                    message.isUser
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      : "bg-gray-100 text-gray-800 border border-gray-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.isUser ? "text-orange-100" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-md border border-gray-200">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-6 bg-gray-50/50">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn của bạn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  rows={1}
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Nhấn Enter để gửi tin nhắn • AI sẽ tư vấn về mua bán xe hơi
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            Powered by AutoChat AI • Tư vấn chuyên nghiệp 24/7
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
