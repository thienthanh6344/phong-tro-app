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

// ========================================
// FIX ICON MẶC ĐỊNH CỦA LEAFLET
// ========================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// ========================================
// ROOM DETAIL
// ========================================

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);


  // ========================================
  // LẤY THÔNG TIN PHÒNG TỪ FIRESTORE
  // ========================================

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


  // ========================================
  // GỌI ĐIỆN
  // ========================================

  const handleCall = () => {
    if (room?.phone) {
      window.location.href =
        "tel:" + room.phone;
    }
  };


  // ========================================
  // GỬI EMAIL
  // ========================================

  const handleEmail = () => {
    if (room?.userEmail) {
      window.location.href =
        "mailto:" + room.userEmail;
    }
  };


  // ========================================
  // LOADING
  // ========================================

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


  // ========================================
  // KHÔNG TÌM THẤY PHÒNG
  // ========================================

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


  // ========================================
  // KIỂM TRA TỌA ĐỘ
  // ========================================

  const hasLocation =
    room.lat !== undefined &&
    room.lat !== null &&
    room.lng !== undefined &&
    room.lng !== null &&
    !isNaN(Number(room.lat)) &&
    !isNaN(Number(room.lng));


  // ========================================
  // GIAO DIỆN
  // ========================================

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />


      <div className="max-w-4xl mx-auto px-4 py-8">


        {/* ==================================
            QUAY LẠI
        ================================== */}

        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Quay lại
        </button>


        <div className="bg-white rounded-xl shadow-md overflow-hidden">


          {/* ==================================
              ẢNH PHÒNG
          ================================== */}

          <img
            src={
              room.imageUrl ||
              "https://placehold.co/800x400?text=Phong+tro"
            }
            alt={room.title || "Phòng trọ"}
            className="w-full h-72 object-cover"
          />


          <div className="p-6">


            {/* ==================================
                TIÊU ĐỀ + GIÁ
            ================================== */}

            <div className="flex justify-between items-start mb-4">

              <h1 className="text-2xl font-bold text-gray-800 flex-1">
                {room.title}
              </h1>

              <span className="text-2xl font-bold text-blue-600 ml-4">
                {room.price
                  ? Number(room.price).toLocaleString("vi-VN")
                  : "0"}{" "}
                đ/tháng
              </span>

            </div>


            {/* ==================================
                THÔNG TIN PHÒNG
            ================================== */}

            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 mb-6">


              {/* ĐỊA CHỈ */}

              <div>
                <p className="text-sm text-gray-500">
                  Địa chỉ
                </p>

                <p className="font-medium">
                  📍 {room.address}
                </p>
              </div>


              {/* DIỆN TÍCH */}

              <div>
                <p className="text-sm text-gray-500">
                  Diện tích
                </p>

                <p className="font-medium">
                  📐 {room.area} m²
                </p>
              </div>


              {/* GIÁ */}

              <div>
                <p className="text-sm text-gray-500">
                  Giá thuê
                </p>

                <p className="font-medium text-blue-600">
                  💰{" "}
                  {room.price
                    ? Number(room.price).toLocaleString("vi-VN")
                    : "0"}{" "}
                  đ/tháng
                </p>
              </div>


              {/* NGƯỜI ĐĂNG */}

              <div>
                <p className="text-sm text-gray-500">
                  Đăng bởi
                </p>

                <p className="font-medium">
                  👤 {room.userEmail}
                </p>
              </div>

            </div>


            {/* ==================================
                MÔ TẢ
            ================================== */}

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


            {/* ==================================
                BẢN ĐỒ
            ================================== */}

            {hasLocation && (
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
                  scrollWheelZoom={true}
                  style={{
                    height: "300px",
                    width: "100%",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >

                  {/* ==========================
                      OPENSTREETMAP
                  ========================== */}

                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />


                  {/* ==========================
                      MARKER
                  ========================== */}

                  <Marker
                    position={[
                      Number(room.lat),
                      Number(room.lng),
                    ]}
                  >

                    <Popup>
                      <strong>
                        {room.title}
                      </strong>

                      <br />

                      {room.address}
                    </Popup>

                  </Marker>

                </MapContainer>

              </div>
            )}


            {/* ==================================
                NẾU KHÔNG CÓ TỌA ĐỘ
            ================================== */}

            {!hasLocation && (
              <div className="mb-6">

                <h2 className="text-lg font-bold mb-3 text-gray-700">
                  📍 Vị trí trên bản đồ
                </h2>

                <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500">
                  Chưa có thông tin vị trí bản đồ.
                </div>

              </div>
            )}


            {/* ==================================
                THÔNG TIN LIÊN HỆ
            ================================== */}

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">


              <h2 className="text-lg font-bold mb-3 text-blue-700">
                📞 Thông tin liên hệ
              </h2>


              {/* SỐ ĐIỆN THOẠI */}

              <p className="text-gray-700 mb-1">

                <span className="font-medium">
                  Số điện thoại:
                </span>{" "}

                {room.phone || "Chưa cập nhật"}

              </p>


              {/* EMAIL */}

              <p className="text-gray-700 mb-4">

                <span className="font-medium">
                  Email:
                </span>{" "}

                {room.userEmail || "Chưa cập nhật"}

              </p>


              {/* ==================================
                  CÁC NÚT LIÊN HỆ
              ================================== */}

              <div className="flex gap-3">


                {/* GỌI */}

                <button
                  onClick={handleCall}
                  disabled={!room.phone}
                  className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📞 Gọi ngay
                </button>


                {/* EMAIL */}

                <button
                  onClick={handleEmail}
                  disabled={!room.userEmail}
                  className="flex-1 bg-white border border-blue-600 text-blue-600 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
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