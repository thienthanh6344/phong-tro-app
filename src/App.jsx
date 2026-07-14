import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import PostRoom from "./pages/PostRoom";
import RoomDetail from "./pages/RoomDetail";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import MyRooms from "./pages/MyRooms";
import EditRoom from "./pages/EditRoom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post" element={<PostRoom />} />
        <Route path="/room/:id" element={<RoomDetail />} />
        <Route path="/chat/:roomId/:ownerId" element={<Chat />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/my-rooms" element={<MyRooms />} />
        <Route path="/edit/:id" element={<EditRoom />} />
      </Routes>
    </BrowserRouter>
  );
}