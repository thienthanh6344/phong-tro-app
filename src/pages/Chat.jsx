import { useEffect, useState, useRef } from "react";
import { ref, push, onValue } from "firebase/database";
import { rtdb, auth } from "../firebase";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Chat() {
  const { roomId, ownerId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  // Tạo chat ID giống nhau cho cả sinh viên và chủ nhà
  const chatId = currentUser
    ? [currentUser.uid, ownerId].sort().join("_") + "_" + roomId
    : null;

  // =========================
  // LẮNG NGHE TIN NHẮN REALTIME
  // =========================
  useEffect(() => {
    if (!currentUser || !chatId) {
      navigate("/login");
      return;
    }

    const chatRef = ref(rtdb, "chats/" + chatId);

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setMessages([]);
        return;
      }

      const msgs = Object.entries(data)
        .map(([id, message]) => ({
          id,
          ...message,
        }))
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId, currentUser, navigate]);

  // =========================
  // TỰ ĐỘNG CUỘN XUỐNG
  // =========================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =========================
  // GỬI TIN NHẮN
  // =========================
  const handleSend = async () => {
    const message = text.trim();

    if (!message || !currentUser || !chatId || sending) {
      return;
    }

    setSending(true);

    try {
      const chatRef = ref(rtdb, "chats/" + chatId);

      await push(chatRef, {
        text: message,
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        timestamp: Date.now(),
      });

      setText("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    } finally {
      setSending(false);
    }
  };

  // =========================
  // ENTER ĐỂ GỬI
  // =========================
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // =========================
  // FORMAT THỜI GIAN
  // =========================
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================
  // AVATAR
  // =========================
  const getInitial = (email) => {
    if (!email) return "?";

    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-3 sm:px-5 py-4 sm:py-6">

        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <span className="text-lg">←</span>
          Quay lại
        </button>

        {/* KHUNG CHAT */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {/* ================= HEADER ================= */}
          <div className="h-[72px] px-4 sm:px-6 border-b border-gray-200 flex items-center justify-between">

            <div className="flex items-center gap-3">

              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-gray-800 text-white flex items-center justify-center font-semibold">
                N
              </div>

              <div>
                <h1 className="font-semibold text-gray-800">
                  Chủ nhà
                </h1>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>

                  <span className="text-xs text-gray-500">
                    Đang hoạt động
                  </span>
                </div>
              </div>
            </div>

            {/* Nút thông tin */}
            <button
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
              title="Thông tin cuộc trò chuyện"
            >
              ⓘ
            </button>
          </div>

          {/* ================= MESSAGE AREA ================= */}
          <div className="h-[560px] overflow-y-auto px-4 sm:px-6 py-5 bg-[#fafafa]">

            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">

                <div className="text-center">

                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                    💬
                  </div>

                  <h3 className="font-medium text-gray-700">
                    Chưa có tin nhắn
                  </h3>

                  <p className="text-sm text-gray-400 mt-1">
                    Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện.
                  </p>

                </div>

              </div>
            ) : (
              <div className="space-y-4">

                {messages.map((msg) => {

                  const isMe =
                    msg.senderId === currentUser?.uid;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${
                        isMe
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      {/* Avatar người nhận */}
                      {!isMe && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs font-medium">
                          {getInitial(msg.senderEmail)}
                        </div>
                      )}

                      <div
                        className={`max-w-[75%] sm:max-w-[65%] ${
                          isMe
                            ? "items-end"
                            : "items-start"
                        } flex flex-col`}
                      >

                        {/* Tên người gửi */}
                        {!isMe && (
                          <span className="text-xs text-gray-400 mb-1 ml-1">
                            {msg.senderEmail}
                          </span>
                        )}

                        {/* Nội dung */}
                        <div
                          className={`px-4 py-2.5 text-sm leading-relaxed ${
                            isMe
                              ? "bg-gray-800 text-white rounded-2xl rounded-br-md"
                              : "bg-white text-gray-700 border border-gray-200 rounded-2xl rounded-bl-md"
                          }`}
                        >
                          {msg.text}
                        </div>

                        {/* Thời gian */}
                        <span
                          className={`text-[11px] text-gray-400 mt-1 ${
                            isMe ? "mr-1" : "ml-1"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </span>

                      </div>

                      {/* Avatar của mình */}
                      {isMe && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
                          {getInitial(currentUser?.email)}
                        </div>
                      )}

                    </div>
                  );
                })}

                <div ref={bottomRef} />

              </div>
            )}

          </div>

          {/* ================= INPUT ================= */}
          <div className="border-t border-gray-200 bg-white p-3 sm:p-4">

            <div className="flex items-end gap-2">

              <div className="flex-1 relative">

                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn..."
                  disabled={sending}
                  className="w-full h-11 border border-gray-300 rounded-xl px-4 pr-12 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-200 disabled:bg-gray-50"
                />

                {/* Emoji đơn giản */}
                <button
                  type="button"
                  onClick={() => setText((prev) => prev + " 🙂")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  title="Thêm biểu tượng"
                >
                  ☺
                </button>

              </div>

              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="h-11 px-5 rounded-xl bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {sending ? "..." : "Gửi"}
              </button>

            </div>

            <p className="text-[11px] text-gray-400 mt-2 ml-1">
              Nhấn Enter để gửi tin nhắn
            </p>

          </div>

        </div>

      </main>
    </div>
  );
}