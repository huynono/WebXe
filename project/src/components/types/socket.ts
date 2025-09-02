// socket.ts
import io from "socket.io-client"; // default import

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

export default socket;
