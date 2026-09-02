import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const CLOUD_NAME = "jodxzlw0";
const UPLOAD_PRESET = "phong_tro_preset";

export default function PostRoom() {
  const [form, setForm] = useState({
    title: "",
    address: "",
    price: "",
    area: "",
    description: "",
    phone: "",
    lat: "",
    lng: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Lấy tọa độ từ địa chỉ bằng OpenStreetMap (miễn phí)
  const handleGeocode = async () => {
  if (!form.address.trim()) {
    setError("Vui lòng nhập địa chỉ trước!");
    return;
  }
  setGeocoding(true);
  setError("");
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}&limit=1&countrycodes=vn`,
      {
        headers: {
          "Accept-Language": "vi",
          "User-Agent": "PhongTroApp/1.0"
        }
      }
    );
    const data = await res.json();
    if (data.length > 0) {
      setForm({ ...form, lat: data[0].lat, lng: data[0].lon });
    } else {
      setError("Không tìm thấy địa chỉ, hãy thử nhập đầy đủ hơn!");
    }
  } catch {
    setError("Lỗi khi lấy tọa độ, vui lòng thử lại!");
  }
  setGeocoding(false);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!auth.currentUser) {
      setError("Bạn cần đăng nhập để đăng tin!");
      return;
    }

    if (!form.title || !form.address || !form.price || !form.area || !form.phone) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        imageUrl = data.secure_url;
      }

      await addDoc(collection(db, "rooms"), {
        title: form.title,
        address: form.address,
        price: Number(form.price),
        area: Number(form.area),
        description: form.description,
        phone: form.phone,
        lat: Number(form.lat) || null,
        lng: Number(form.lng) || null,
        imageUrl,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });

      navigate("/");
    } catch (err) {
      setError("Đăng tin thất bại: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">📝 Đăng tin phòng trọ</h2>

          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề tin đăng *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="VD: Phòng trọ sạch sẽ gần ĐH Mở"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ *</label>
              <div className="flex gap-2">
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="VD: 123 Nguyễn Chí Thanh, Quận 5, TP.HCM"
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={geocoding}
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50 whitespace-nowrap"
                >
                  {geocoding ? "Đang lấy..." : "📍 Lấy tọa độ"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vĩ độ (Lat)</label>
                <input
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  placeholder="VD: 10.7769"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kinh độ (Lng)</label>
                <input
                  name="lng"
                  value={form.lng}
                  onChange={handleChange}
                  placeholder="VD: 106.7009"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                />
              </div>
            </div>

            {form.lat && form.lng && (
              <p className="text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                ✅ Đã lấy tọa độ thành công! Lat: {Number(form.lat).toFixed(4)}, Lng: {Number(form.lng).toFixed(4)}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Giá thuê (đ/tháng) *</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="VD: 2500000"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Diện tích (m²) *</label>
                <input
                  name="area"
                  type="number"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="VD: 20"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="VD: 0901234567"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Mô tả tiện ích, nội thất..."
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ảnh phòng trọ</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="w-full border rounded-lg px-4 py-2 text-sm"
              />
              {preview && (
                <img src={preview} alt="preview" className="mt-3 w-full h-48 object-cover rounded-lg" />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
            >
              {loading ? "Đang đăng tin..." : "✅ Đăng tin ngay"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}