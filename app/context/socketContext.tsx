import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useUserProfile } from "./userContext";
import { SOCKET_BASE_URL } from "../apiUrl";
import { useCallStore } from "@/store/store";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUserProfile();
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socketError, setSocketError] = useState(null);
  const { setIncomingCall, setIncomingCallDetails, setIsUnlimitedCall } = useCallStore();
  useEffect(() => {
    if (!user || socketRef.current) return;

    const socket = io(SOCKET_BASE_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true, // ✅ important
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    //Handle socket connection errors
    socket.on("connect_error", (err) => {
      setSocketError(`Socket connection failed: ${err.message}`);
      console.error("Socket connection error:", err);
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join", user._id || user.id);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("userOnline", (userId) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    socket.on("userOffline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.on("incoming", (data) => {
      console.log("Incoming call:", data);
      setIncomingCall(true);
      setIncomingCallDetails(data);
      // ✅ This is the fix
      if (data.bothHavePlan !== undefined) {
        setIsUnlimitedCall(data.bothHavePlan);
      }
    });
    socket.on("userbussy", (data) => {
      alert("user is busy");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket disconnected");
        socketRef.current = null;
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, onlineUsers, socketError }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);