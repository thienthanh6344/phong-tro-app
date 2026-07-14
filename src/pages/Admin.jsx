import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tab, setTab] = useState("rooms");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) { navigate("/login"); return; }

      const docSnap = await (await import("firebase/firestore")).getDoc(
        doc(db, "users", user.uid)
      );
      if (!docSnap.exists() || docSnap.data().role !== "admin") {
        navigate("/");
        return;
      }

      fetchData();
    };
    checkAdmin();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const usersSnap = await getDocs(collection(db, "users"));
    setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const roomsSnap = await getDocs(collection(db, "rooms"));
    setRooms(roomsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    setLoading(false);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Xóa phòng trọ này?")) return;
    await deleteDoc(doc(db, "rooms", roomId));
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  const handleChangeRole = async (userId, newRole) => {
    await updateDoc(doc(db, "users", userId), { role: newRole });
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">👑 Trang Quản Trị Admin</h1>

        {/* Thống kê */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            <p className="text-gray-500 mt-1">Tổng người dùng</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-green-600">{rooms.length}</p>
            <p className="text-gray-500 mt-1">Tổng phòng trọ</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-yellow-500">
              {users.filter(u => u.role === "chunha").length}
            </p>
            <p className="text-gray-500 mt-1">Chủ nhà</p>
          </div>
        </div>

        {/* Tab */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab("rooms")}
            className={`px-5 py-2 rounded-lg font-semibold text-sm ${
              tab === "rooms"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            🏠 Quản lý phòng ({rooms.length})
          </button>
          <button
            onClick={() => setTab("users")}
            className={`px-5 py-2 rounded-lg font-semibold text-sm ${
              tab === "users"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            👥 Quản lý người dùng ({users.length})
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Đang tải...</p>
        ) : tab === "rooms" ? (

          /* DANH SÁCH PHÒNG */
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600">Tiêu đề</th>
                  <th className="text-left px-4 py-3 text-gray-600">Địa chỉ</th>
                  <th className="text-left px-4 py-3 text-gray-600">Giá</th>
                  <th className="text-left px-4 py-3 text-gray-600">Người đăng</th>
                  <th className="text-left px-4 py-3 text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{room.title}</td>
                    <td className="px-4 py-3 text-gray-500">{room.address}</td>
                    <td className="px-4 py-3 text-blue-600">
                      {room.price?.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="px-4 py-3 text-gray-500">{room.userEmail}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rooms.length === 0 && (
              <p className="text-center text-gray-400 py-8">Chưa có phòng nào</p>
            )}
          </div>

        ) : (

          /* DANH SÁCH USER */
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 text-gray-600">Vai trò hiện tại</th>
                  <th className="text-left px-4 py-3 text-gray-600">Đổi vai trò</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-600"
                          : user.role === "chunha"
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600"
                      }`}>
                        {user.role === "admin" ? "👑 Admin"
                          : user.role === "chunha" ? "🏠 Chủ nhà"
                          : "🎓 Sinh viên"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="sinhvien">🎓 Sinh viên</option>
                        <option value="chunha">🏠 Chủ nhà</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center text-gray-400 py-8">Chưa có người dùng nào</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}