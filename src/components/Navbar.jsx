import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">🏠 PhòngTrọ SV</Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm">
              {role === "chunha" ? "🏠" : "🎓"} {user.email}
            </span>

            {/* Chỉ chủ nhà mới thấy nút Đăng tin */}
            {role === "chunha" && (
            <>
              <Link
                 to="/my-rooms"
                  className="hover:underline text-sm"
              >
               Phòng của tôi
              </Link>
              <Link
                 to="/post"
                className="bg-yellow-400 text-black px-4 py-1 rounded-lg font-semibold hover:bg-yellow-300 text-sm"
              >
      + Đăng tin
    </Link>
  </>
)}

            {/* Chỉ admin mới thấy nút Quản trị */}
            {role === "admin" && (
              <Link
                to="/admin"
                className="bg-red-500 text-white px-4 py-1 rounded-lg font-semibold hover:bg-red-600 text-sm"
              >
                👑 Quản trị
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-white text-blue-700 px-4 py-1 rounded-lg font-semibold hover:bg-gray-100 text-sm"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline text-sm">Đăng nhập</Link>
            <Link
              to="/register"
              className="bg-white text-blue-700 px-4 py-1 rounded-lg font-semibold hover:bg-gray-100 text-sm"
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}