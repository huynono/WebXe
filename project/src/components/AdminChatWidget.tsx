import React, { useState, useEffect, useRef } from "react";
import { X, Send, Users } from "lucide-react";
import { sendMessage, onNewMessage, offNewMessage, Message  } from "./types/socketclient";

// Kiểu dữ liệu room từ server
type ChatRoomFromServer = {
  id: number;
  userId: number;
  user: { id: number; name: string; email?: string };
};

type ChatRoom = {
  roomId: number;
  userId: number;
  userName: string;
};

const AdminChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll xuống cuối chat mỗi khi messages thay đổi
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // === Fetch rooms ===
  useEffect(() => {
    if (!open) return;

    const fetchRooms = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/chatadmin/rooms", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
        });

        if (!res.ok) {
          console.error("Lỗi server khi fetch rooms:", res.status, res.statusText);
          return;
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Không nhận được JSON từ server:", await res.text());
          return;
        }

        const data: ChatRoomFromServer[] = await res.json();
        const mappedRooms: ChatRoom[] = data.map((room) => ({
          roomId: room.id,
          userId: room.userId,
          userName: room.user.name,
        }));

        setRooms(mappedRooms);
      } catch (err) {
        console.error("Lỗi khi fetch rooms:", err);
      }
    };

    fetchRooms();
  }, [open]);

  // === Chọn room và fetch messages ===
  const selectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
     // FE emit join room trước khi fetch messages
    try {
      const res = await fetch(`http://localhost:3000/api/chatadmin/messages/${room.roomId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Không nhận được JSON từ server:", await res.text());
        return;
      }

      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Lỗi fetch messages:", err);
    }
  };

  // === Lắng nghe tin nhắn realtime ===
  useEffect(() => {
  const handleNewMessage = (msg: Message) => {
    if (selectedRoom && msg.roomId === selectedRoom.roomId) {
      setMessages((prev) => [...prev, msg]);
    }
  };

  onNewMessage(handleNewMessage, true); // ✅ dùng adminSocket

  return () => offNewMessage(true); // ✅ gỡ listener adminSocket
}, [selectedRoom]);


  // === Gửi tin nhắn ===
 const handleSend = () => {
  if (!message.trim() || !selectedRoom) return;

  // Tạo local message trước
  const localMsg: Message = {
    id: Date.now(), // tạm ID local
    roomId: selectedRoom.roomId,
    content: message,
    role: "admin",
    from: {
      id: 1,
      name: "Admin",
      role: "admin",
    },
  };

  setMessages((prev) => [...prev, localMsg]);

  // Gửi qua socket
  sendMessage(message, selectedRoom.roomId, true);

  setMessage("");
};


  // === UI ===
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-emerald-600 p-4 rounded-full shadow-xl hover:bg-emerald-700 hover:scale-110 transition-all duration-200 fixed bottom-6 right-6 z-50 group"
      >
        <Users className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      </button>
    );

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white shadow-2xl rounded-2xl flex flex-col border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold">Admin Chat Panel</h3>
            <span className="text-xs text-emerald-100">
              {selectedRoom ? `Chat với ${selectedRoom.userName}` : `${rooms.length} cuộc trò chuyện`}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setOpen(false)} 
          className="hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Danh sách rooms */}
        <div className="w-32 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-2 border-b border-gray-200 bg-gray-100">
            <span className="text-xs font-medium text-gray-600">Khách hàng</span>
          </div>
          {rooms.map((room) => (
            <div
              key={room.roomId}
              className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-100 ${
                selectedRoom?.roomId === room.roomId ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""
              }`}
              onClick={() => selectRoom(room)}
            >
              <div className="text-sm font-medium text-gray-800 truncate">
                {room.userName}
              </div>
              <div className="text-xs text-gray-500">
                ID: {room.userId}
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="p-3 text-xs text-gray-500 text-center">
              Chưa có cuộc trò chuyện
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat messages */}
              <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-3">
                {messages.map((msg) => {
  const msgRole = msg.role || msg.from?.role || "user"; // fallback an toàn

  return (
    <div
      key={msg.id ?? Math.random()}
      className={`flex ${msgRole === "admin" ? "justify-end" : "justify-start"}`}
    >
      <div className="flex flex-col max-w-[70%]">
        <div
          className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
            msgRole === "admin"
              ? "bg-emerald-600 text-white rounded-br-md"
              : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
          }`}
        >
          {msg.content}
        </div>
        <span
          className={`text-xs text-gray-400 mt-1 ${
            msgRole === "admin" ? "text-right" : "text-left"
          }`}
        >
          {msgRole === "admin" ? "Admin" : selectedRoom?.userName}
        </span>
      </div>
    </div>
  );
})}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-white">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn để trả lời khách hàng..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="p-2 bg-emerald-600 rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Chọn một cuộc trò chuyện</p>
                <p className="text-sm text-gray-400">để bắt đầu hỗ trợ khách hàng</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatWidget;