import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";

export default function MyRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      const q = query(collection(db, "rooms"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRooms(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (roomId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa phòng này?")) return;
    await deleteDoc(doc(db, "rooms", roomId));
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🏠 Phòng trọ của tôi</h1>
          <Link
            to="/post"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 text-sm"
          >
            + Đăng tin mới
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Đang tải...</p>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <p className="text-gray-400 text-lg mb-4">Bạn chưa có phòng trọ nào!</p>
            <Link
              to="/post"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Đăng tin ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map(room => (
              <div key={room.id} className="bg-white rounded-xl shadow p-5 flex gap-4 items-center">
                <img
                  src={room.imageUrl || "https://placehold.co/120x90?text=Phong+tro"}
                  alt={room.title}
                  className="w-28 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{room.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">📍 {room.address}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-blue-600 font-semibold">
                      {room.price?.toLocaleString("vi-VN")} đ/tháng
                    </span>
                    <span className="text-gray-400">📐 {room.area} m²</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link
                    to={`/room/${room.id}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 text-center"
                  >
                    👁️ Xem
                  </Link>
                  <Link
                    to={`/edit/${room.id}`}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-300 text-center"
                  >
                    ✏️ Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 text-center"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}