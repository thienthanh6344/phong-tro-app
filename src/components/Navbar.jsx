import { useEffect, useState } from "react";

import {
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  ref,
  onValue,
  update,
} from "firebase/database";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { auth, db, rtdb } from "../firebase";

export default function Navbar() {

  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  const [notifications, setNotifications] =
    useState([]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const navigate = useNavigate();

  // ==========================================
  // LẤY USER ĐĂNG NHẬP
  // ==========================================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {

          setUser(currentUser);

          if (!currentUser) {
            setRole("");
            return;
          }

          try {

            const userRef = doc(
              db,
              "users",
              currentUser.uid
            );

            const userSnap =
              await getDoc(userRef);

            if (userSnap.exists()) {

              setRole(
                userSnap.data().role || ""
              );

            }

          } catch (error) {

            console.error(
              "Lỗi lấy user:",
              error
            );

          }

        }
      );

    return () => unsubscribe();

  }, []);

  // ==========================================
  // REALTIME THÔNG BÁO
  // ==========================================

  useEffect(() => {

    if (!user) {
      setNotifications([]);
      return;
    }

    const notificationRef = ref(
      rtdb,
      "notifications/" + user.uid
    );

    const unsubscribe = onValue(
      notificationRef,
      (snapshot) => {

        const data = snapshot.val();

        if (!data) {

          setNotifications([]);

          return;
        }

        const list =
          Object.entries(data)
            .map(([id, notification]) => ({
              id,
              ...notification,
            }))
            .sort(
              (a, b) =>
                (b.timestamp || 0) -
                (a.timestamp || 0)
            );

        setNotifications(list);

      },
      (error) => {

        console.error(
          "Lỗi đọc notification:",
          error
        );

      }
    );

    return () => unsubscribe();

  }, [user]);

  // ==========================================
  // ĐĂNG XUẤT
  // ==========================================

  const handleLogout = async () => {

    try {

      await signOut(auth);

      navigate("/");

    } catch (error) {

      console.error(
        "Lỗi đăng xuất:",
        error
      );

    }

  };

  // ==========================================
  // SỐ THÔNG BÁO CHƯA ĐỌC
  // ==========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.read !== true
    ).length;

  // ==========================================
  // CLICK THÔNG BÁO
  // ==========================================

  const handleNotificationClick =
    async (notification) => {

      try {

        // Đánh dấu đã đọc

        if (!notification.read) {

          const notificationRef =
            ref(
              rtdb,
              `notifications/${user.uid}/${notification.id}`
            );

          await update(
            notificationRef,
            {
              read: true,
            }
          );

        }

        // Đóng dropdown

        setShowNotifications(false);

        // Chuyển đến cuộc trò chuyện

        navigate(
          `/chat/${notification.roomId}/${notification.senderId}`
        );

      } catch (error) {

        console.error(
          "Lỗi xử lý thông báo:",
          error
        );

      }

    };

  return (
    <nav className="bg-blue-600 text-white shadow">

      <div className="max-w-7xl mx-auto px-4">

        <div className="h-[70px] flex items-center justify-between">

          {/* LOGO */}

          <Link
            to="/"
            className="text-2xl font-bold"
          >
            🏠 PhòngTrọ SV
          </Link>

          {/* RIGHT */}

          <div className="flex items-center gap-3">

            {user ? (
              <>

                {/* EMAIL */}

                <span className="text-sm hidden md:block">
                  🎓 {user.email}
                </span>

                {/* =====================
                    THÔNG BÁO
                ====================== */}

                <div className="relative">

                  <button
                    onClick={() =>
                      setShowNotifications(
                        !showNotifications
                      )
                    }
                    className="relative bg-blue-500 hover:bg-blue-400 w-10 h-10 rounded-full flex items-center justify-center"
                  >

                    <span className="text-xl">
                      🔔
                    </span>

                    {/* SỐ CHƯA ĐỌC */}

                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                        {unreadCount > 99
                          ? "99+"
                          : unreadCount}
                      </span>
                    )}

                  </button>

                  {/* DROPDOWN */}

                  {showNotifications && (

                    <div className="absolute right-0 mt-2 w-96 bg-white text-gray-800 rounded-xl shadow-xl border z-50 overflow-hidden">

                      {/* HEADER */}

                      <div className="px-4 py-3 border-b font-bold flex justify-between">

                        <span>
                          🔔 Thông báo
                        </span>

                        {unreadCount > 0 && (
                          <span className="text-sm text-red-500">
                            {unreadCount} chưa đọc
                          </span>
                        )}

                      </div>

                      {/* DANH SÁCH */}

                      <div className="max-h-[400px] overflow-y-auto">

                        {notifications.length === 0 ? (

                          <div className="p-6 text-center text-gray-400">

                            <div className="text-3xl mb-2">
                              🔔
                            </div>

                            <p>
                              Chưa có thông báo
                            </p>

                          </div>

                        ) : (

                          notifications.map(
                            (notification) => (

                              <button
                                key={
                                  notification.id
                                }
                                onClick={() =>
                                  handleNotificationClick(
                                    notification
                                  )
                                }
                                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                                  notification.read
                                    ? "bg-white"
                                    : "bg-blue-50"
                                }`}
                              >

                                <div className="flex gap-3">

                                  {/* ICON */}

                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    💬
                                  </div>

                                  {/* CONTENT */}

                                  <div className="flex-1 min-w-0">

                                    <p className="font-semibold text-sm">

                                      Tin nhắn mới

                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">

                                      {notification.senderEmail}

                                    </p>

                                    <p className="text-sm mt-1 truncate">

                                      {notification.text}

                                    </p>

                                    <p className="text-xs text-gray-400 mt-1">

                                      {notification.timestamp
                                        ? new Date(
                                            notification.timestamp
                                          ).toLocaleString(
                                            "vi-VN"
                                          )
                                        : ""}

                                    </p>

                                  </div>

                                  {/* CHƯA ĐỌC */}

                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                                  )}

                                </div>

                              </button>

                            )
                          )

                        )}

                      </div>

                    </div>

                  )}

                </div>

                {/* =====================
                    ADMIN
                ====================== */}

                {role === "admin" && (

                  <Link
                    to="/admin"
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold text-sm"
                  >
                    👑 Quản trị
                  </Link>

                )}

                {/* ĐĂNG XUẤT */}

                <button
                  onClick={handleLogout}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100"
                >
                  Đăng xuất
                </button>

              </>

            ) : (

              <>

                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm"
                >
                  Đăng nhập
                </Link>

                <Link
                  to="/register"
                  className="bg-blue-500 px-4 py-2 rounded-lg font-semibold text-sm"
                >
                  Đăng ký
                </Link>

              </>

            )}

          </div>

        </div>

      </div>

    </nav>
  );
}