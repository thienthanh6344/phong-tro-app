import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function EditRoom() {
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "", address: "", price: "", area: "", description: "", phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoom = async () => {
      const docSnap = await getDoc(doc(db, "rooms", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userId !== auth.currentUser?.uid) {
          navigate("/");
          return;
        }
        setForm({
          title: data.title || "",
          address: data.address || "",
          price: data.price || "",
          area: data.area || "",
          description: data.description || "",
          phone: data.phone || "",
        });
      }
      setLoading(false);
    };
    fetchRoom();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.address || !form.price || !form.area || !form.phone) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "rooms", id), {
        title: form.title,
        address: form.address,
        price: Number(form.price),
        area: Number(form.area),
        description: form.description,
        phone: form.phone,
      });
      navigate("/my-rooms");
    } catch (err) {
      setError("Lỗi khi cập nhật: " + err.message);
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <p className="text-center mt-20 text-gray-500">Đang tải...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">✏️ Chỉnh sửa phòng trọ</h2>

          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ *</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Giá (đ/tháng) *</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
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
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/my-rooms")}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}