import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      const snapshot = await getDocs(collection(db, "rooms"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRooms(data);
      setFiltered(data);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  const handleFilter = () => {
    let result = [...rooms];

    if (search.trim()) {
      result = result.filter(room =>
        room.title?.toLowerCase().includes(search.toLowerCase()) ||
        room.address?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (maxPrice) {
      result = result.filter(room => room.price <= Number(maxPrice));
    }

    if (minArea) {
      result = result.filter(room => room.area >= Number(minArea));
    }

    setFiltered(result);
  };

  const handleReset = () => {
    setSearch("");
    setMaxPrice("");
    setMinArea("");
    setFiltered(rooms);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Hero + Search */}
      <div className="bg-blue-600 py-10 px-4 text-center">
        <h2 className="text-white text-3xl font-bold mb-4">
          Tìm phòng trọ dành cho sinh viên
        </h2>
        <div className="flex justify-center gap-2 max-w-xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, khu vực, địa chỉ..."
            className="flex-1 px-4 py-2 rounded-lg focus:outline-none"
          />
          <button
            onClick={handleFilter}
            className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-300"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Bộ lọc */}
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h3 className="font-bold text-gray-700 mb-4">🔍 Bộ lọc nâng cao</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Giá tối đa (đ/tháng)
              </label>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Tất cả mức giá</option>
                <option value="1000000">Dưới 1 triệu</option>
                <option value="2000000">Dưới 2 triệu</option>
                <option value="3000000">Dưới 3 triệu</option>
                <option value="5000000">Dưới 5 triệu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Diện tích tối thiểu (m²)
              </label>
              <select
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Tất cả diện tích</option>
                <option value="10">Trên 10 m²</option>
                <option value="15">Trên 15 m²</option>
                <option value="20">Trên 20 m²</option>
                <option value="30">Trên 30 m²</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleFilter}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Áp dụng
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
              >
                Xóa lọc
              </button>
            </div>

          </div>
        </div>

        {/* Kết quả */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-700">Phòng trọ mới nhất</h3>
          <span className="text-sm text-gray-500">
            Tìm thấy {filtered.length} phòng
          </span>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">Không tìm thấy phòng phù hợp!</p>
            <button
              onClick={handleReset}
              className="text-blue-600 hover:underline text-sm"
            >
              Xóa bộ lọc để xem tất cả
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(room => (
              <Link to={`/room/${room.id}`} key={room.id}>
                <div className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden cursor-pointer">
                  <img
                    src={room.imageUrl || "https://placehold.co/400x250?text=Phong+tro"}
                    alt={room.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-bold text-lg text-gray-800 mb-1">{room.title}</h4>
                    <p className="text-gray-500 text-sm mb-2">📍 {room.address}</p>
                    <p className="text-blue-600 font-semibold text-lg">
                      {room.price?.toLocaleString("vi-VN")} đ/tháng
                    </p>
                    <div className="flex gap-2 mt-2 text-sm text-gray-500">
                      <span>📐 {room.area} m²</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}