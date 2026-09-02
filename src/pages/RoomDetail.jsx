import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix icon mặc định của Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function RoomDetail() {
  const { id } = useParams();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // =========================
  // LẤY THÔNG TIN PHÒNG
  // =========================
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const docRef = doc(db, "rooms", id);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRoom({
            id: docSnap.id,
            ...docSnap.data(),
          });
        }
      } catch (error) {
        console.error(
          "Lỗi lấy thông tin phòng:",
          error
        );
      }

      setLoading(false);
    };

    fetchRoom();
  }, [id]);

  // =========================
  // GỌI ĐIỆN
  // =========================
  const handleCall = () => {
    window.location.href =
      "tel:" + room.phone;
  };

  // =========================
  // GỬI EMAIL
  // =========================
  const handleEmail = () => {
    window.location.href =
      "mailto:" + room.userEmail;
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">

        <Navbar />

        <p className="text-center mt-20 text-gray-500">
          Đang tải...
        </p>

      </div>
    );
  }

  // =========================
  // KHÔNG TÌM THẤY
  // =========================
  if (!room) {
    return (
      <div className="min-h-screen bg-gray-100">

        <Navbar />

        <p className="text-center mt-20 text-gray-500">
          Không tìm thấy phòng trọ!
        </p>

      </div>
    );
  }

  // =========================
  // GIAO DIỆN
  // =========================
  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* QUAY LẠI */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">

          {/* ẢNH */}
          <img
            src={
              room.imageUrl ||
              "https://placehold.co/800x400?text=Phong+tro"
            }
            alt={room.title}
            className="w-full h-72 object-cover"
          />

          <div className="p-6">

            {/* TIÊU ĐỀ + GIÁ */}
            <div className="flex justify-between items-start mb-4">

              <h1 className="text-2xl font-bold text-gray-800 flex-1">
                {room.title}
              </h1>

              <span className="text-2xl font-bold text-blue-600 ml-4">
                {room.price?.toLocaleString("vi-VN")} đ/tháng
              </span>

            </div>

            {/* THÔNG TIN */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 mb-6">

              <div>
                <p className="text-sm text-gray-500">
                  Địa chỉ
                </p>

                <p className="font-medium">
                  📍 {room.address}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Diện tích
                </p>

                <p className="font-medium">
                  📐 {room.area} m²
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Giá thuê
                </p>

                <p className="font-medium text-blue-600">
                  💰{" "}
                  {room.price?.toLocaleString("vi-VN")}
                  {" "}đ/tháng
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Đăng bởi
                </p>

                <p className="font-medium">
                  👤 {room.userEmail}
                </p>
              </div>

            </div>

            {/* MÔ TẢ */}
            {room.description && (
              <div className="mb-6">

                <h2 className="text-lg font-bold mb-2 text-gray-700">
                  Mô tả chi tiết
                </h2>

                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {room.description}
                </p>

              </div>
            )}

            {/* BẢN ĐỒ */}
            {room.lat && room.lng && (
              <div className="mb-6">

                <h2 className="text-lg font-bold mb-3 text-gray-700">
                  📍 Vị trí trên bản đồ
                </h2>

                <MapContainer
                  center={[
                    Number(room.lat),
                    Number(room.lng),
                  ]}
                  zoom={16}
                  style={{
                    height: "300px",
                    width: "100%",
                    borderRadius: "12px",
                  }}
                >

                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                  />

                  <Marker
                    position={[
                      Number(room.lat),
                      Number(room.lng),
                    ]}
                  >

                    <Popup>
                      {room.title}
                    </Popup>

                  </Marker>

                </MapContainer>

              </div>
            )}

            {/* LIÊN HỆ */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">

              <h2 className="text-lg font-bold mb-3 text-blue-700">
                📞 Thông tin liên hệ
              </h2>

              <p className="text-gray-700 mb-1">
                <span className="font-medium">
                  Số điện thoại:
                </span>{" "}
                {room.phone}
              </p>

              <p className="text-gray-700 mb-4">
                <span className="font-medium">
                  Email:
                </span>{" "}
                {room.userEmail}
              </p>

              <div className="flex gap-3">

                {/* GỌI */}
                <button
                  onClick={handleCall}
                  className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  📞 Gọi ngay
                </button>

                {/* EMAIL */}
                <button
                  onClick={handleEmail}
                  className="flex-1 bg-white border border-blue-600 text-blue-600 text-center py-3 rounded-lg font-semibold hover:bg-blue-50"
                >
                  ✉️ Gửi email
                </button>

                {/* CHAT */}
                <button
                  onClick={() =>
                    navigate(
                      `/chat/${room.id}/${room.userId}`
                    )
                  }
                  className="flex-1 bg-green-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-600"
                >
                  💬 Nhắn tin
                </button>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}