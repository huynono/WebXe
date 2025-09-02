import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { sendMessage, onNewMessage, offNewMessage, Message, userSocket } from "./types/socketclient";

interface ChatWidgetProps {
  userId: number;
  userName?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ userId, userName }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // === Socket connection management ===
  useEffect(() => {
    const handleConnect = () => {
      console.log("✅ User socket connected");
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("❌ User socket disconnected");
      setIsConnected(false);
    };

    userSocket.on("connect", handleConnect);
    userSocket.on("disconnect", handleDisconnect);

    // Check initial connection state
    setIsConnected(userSocket.connected);

    return () => {
      userSocket.off("connect", handleConnect);
      userSocket.off("disconnect", handleDisconnect);
    };
  }, []);

  // === Ensure room exists and load messages ===
  useEffect(() => {
  if (!userId) return;

  const initializeChat = async () => {
    setIsLoading(true);
    try {
      // 1️⃣ Lấy room hiện tại từ localStorage
      let roomId = Number(localStorage.getItem(`chat_currentRoom_${userId}`)) || 0;

      // 2️⃣ Nếu chưa có room, tạo room mới
      if (!roomId) {
        const roomResponse = await fetch("http://localhost:3000/api/chatadmin/rooms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ userId }),
        });
        const roomData = await roomResponse.json();
        roomId = roomData.roomId;
        localStorage.setItem(`chat_currentRoom_${userId}`, roomId.toString());
      }

      // 3️⃣ Load tin nhắn từ localStorage theo roomId
      const stored = localStorage.getItem(`chat_messages_${userId}_room_${roomId}`);
      if (stored) {
        const cached: Message[] = JSON.parse(stored);
        setMessages(cached);
      }

      // 4️⃣ Fetch lịch sử tin nhắn từ API theo roomId
      const messagesResponse = await fetch(
        `http://localhost:3000/api/chatadmin/user/${userId}/messages/${roomId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
      );
      const messagesData = await messagesResponse.json();
      if (messagesData.success && Array.isArray(messagesData.messages)) {
        setMessages(messagesData.messages);
        localStorage.setItem(`chat_messages_${userId}_room_${roomId}`, JSON.stringify(messagesData.messages));
      }

    } catch (err) {
      console.error("Error initializing chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  initializeChat();
}, [userId]);


  // === Save messages to localStorage whenever they change ===
  useEffect(() => {
    if (messages.length > 0 && userId) {
      localStorage.setItem(`chat_messages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  // === Listen for realtime messages ===
  useEffect(() => {
    const handleNewMessage = (msg: Message) => {
      console.log("New message from socket:", msg);
      
      // Add message if it's for this user or from admin
      if (msg.from.id === userId || msg.role === "admin") {
        setMessages(prev => {
          // Avoid duplicates by checking if message already exists
          const exists = prev.some(m => m.id === msg.id || 
            (m.content === msg.content && m.from.id === msg.from.id && Math.abs((m.id || 0) - (msg.id || 0)) < 1000));
          
          if (exists) {
            console.log("Message already exists, skipping");
            return prev;
          }

          const updated = [...prev, msg];
          localStorage.setItem(`chat_messages_${userId}`, JSON.stringify(updated));
          return updated;
        });
      }
    };

    onNewMessage(handleNewMessage);
    return () => offNewMessage();
  }, [userId]);

  // === Handle opening chat widget ===
  const handleOpen = () => {
    setOpen(true);
    // Reconnect socket if needed
    if (!userSocket.connected) {
      userSocket.connect();
    }
  };

  // === Send message ===
  const handleSend = async () => {
    if (!message.trim() || !isConnected) return;

    // Create optimistic local message
    const localMsg: Message = {
      id: Date.now(),
      roomId: 0, // Will be set by backend
      content: message,
      role: "user",
      from: { 
        id: userId, 
        name: userName || "Bạn", 
        role: "user" 
      },
    };

    // Add to local state immediately
    setMessages(prev => [...prev, localMsg]);

    try {
      // Send via socket
      sendMessage(message);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove the optimistic message if sending fails
      setMessages(prev => prev.filter(m => m.id !== localMsg.id));
    }
  };

  // === UI ===
  return (
    <div className="fixed bottom-8 right-8 z-50">
      {open ? (
        <div className="w-96 h-[600px] bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl flex flex-col border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/30">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Hỗ trợ khách hàng</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full shadow-sm ${
                      isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                    }`}></div>
                    <span className="text-sm text-blue-100 font-medium">
                      {isConnected ? "Đang hoạt động" : "Đang kết nối..."}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="hover:bg-white/20 rounded-2xl p-2 transition-all duration-200 hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Chat body */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white space-y-6">
            {isLoading ? (
              <div className="text-center mt-20">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Đang tải tin nhắn...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center mt-20">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Chào mừng bạn đến với hỗ trợ</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện<br />
                  với đội ngũ hỗ trợ của chúng tôi
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id || Math.random()} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex flex-col max-w-[85%]">
                    <div className={`px-6 py-4 rounded-3xl text-sm shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
                      msg.role === "user" 
                        ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-lg shadow-blue-200" 
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-lg shadow-gray-200"
                    }`}>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                    <div className={`mt-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                      <span className="text-xs text-gray-400 font-medium">
                        {msg.role === "admin" ? "Đội hỗ trợ" : "Bạn"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 bg-white border-t border-gray-100">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={isConnected ? "Nhập tin nhắn của bạn..." : "Đang kết nối..."}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  disabled={!isConnected}
                  className="w-full px-6 py-4 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200 placeholder-gray-400 disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!message.trim() || !isConnected}
                className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:hover:scale-100"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={handleOpen}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl shadow-2xl hover:from-blue-700 hover:to-indigo-800 hover:scale-110 transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <MessageCircle className="w-7 h-7 text-white relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          {messages.length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">!</span>
            </div>
          )}
        </button>
      )}
    </div>
  );
};

export default ChatWidget;