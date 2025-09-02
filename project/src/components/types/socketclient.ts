import io from "socket.io-client";

export type UserInfo = {
  id: number;
  name: string;
  email?: string;
  role: "user" | "admin";
};

export type Message = {
  id?: number;
  roomId: number;
  content: string;
  from: UserInfo;
  role: "user" | "admin";
};

const getToken = (role: "user" | "admin" = "user"): string => {
  return role === "admin"
    ? localStorage.getItem("adminToken") || ""
    : localStorage.getItem("token") || "";
};

// Socket cho user (mặc định)
export const userSocket = io("http://localhost:3000", {
  transports: ["websocket"],
  autoConnect: true,
  auth: { token: getToken("user") },
});

// Socket cho admin (tạo 1 lần duy nhất)
export const adminSocket = io("http://localhost:3000", {
  transports: ["websocket"],
  autoConnect: true,
  auth: { token: getToken("admin") },
});

// Gửi tin nhắn
export const sendMessage = (
  content: string,
  roomId?: number,
  useAdminSocket = false
): void => {
  const activeSocket = useAdminSocket ? adminSocket : userSocket;
  activeSocket.emit("sendMessage", { content, roomId });
};

// Lắng nghe tin nhắn mới
export const onNewMessage = (
  callback: (msg: Message) => void,
  useAdminSocket = false
): void => {
  const activeSocket = useAdminSocket ? adminSocket : userSocket;
  activeSocket.on("newMessage", callback);
};

// Ngắt listener
export const offNewMessage = (useAdminSocket = false): void => {
  const activeSocket = useAdminSocket ? adminSocket : userSocket;
  activeSocket.off("newMessage");
};

export default userSocket;
