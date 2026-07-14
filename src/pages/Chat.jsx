import { useEffect, useState, useRef } from "react";
import { ref, push, onValue, serverTimestamp } from "firebase/database";
import { rtdb, auth } from "../firebase";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Chat() {
  const { roomId, ownerId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  // Tạo chatId duy nhất từ 2 user (sắp xếp để tránh trùng)
  const chatId = [currentUser?.uid, ownerId].sort().join("_") + "_" + roomId;

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const chatRef = ref(rtdb, "chats/" + chatId);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;

    const chatRef = ref(rtdb, "chats/" + chatId);
    await push(chatRef, {
      text: text.trim(),
      senderId: currentUser.uid,
      senderEmail: currentUser.email,
      timestamp: Date.now(),
    });

    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      <div className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col flex-1">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline text-sm"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-xl shadow-md flex flex-col h-[600px]">
          {/* Header */}
          <div className="bg-blue-600 text-white px-5 py-4 rounded-t-xl">
            <h2 className="font-bold text-lg">💬 Chat về phòng trọ</h2>
            <p className="text-blue-200 text-sm">Nhắn tin trực tiếp với chủ nhà</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-8">
                Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
              </p>
            )}
            {messages.map((msg, index) => {
              const isMe = msg.senderId === currentUser?.uid;
              return (
                <div
                  key={index}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}>
                    {!isMe && (
                      <p className="text-xs text-gray-500 mb-1">{msg.senderEmail}</p>
                    )}
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t px-4 py-3 flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn... (Enter để gửi)"
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}