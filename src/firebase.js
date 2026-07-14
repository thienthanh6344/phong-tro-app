import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
  // Dán config của bạn vào đây
  apiKey: "AIzaSyBYGP4orBIHCd5AVBUXhxCv_ORyZnB8vKg",
  authDomain: "phong-tro-app-dc5bb.firebaseapp.com",
  projectId: "phong-tro-app-dc5bb",
  storageBucket: "phong-tro-app-dc5bb.firebasestorage.app",
  messagingSenderId: "723899523766",
  appId: "1:723899523766:web:2c6e4f5da07408cd15bc17",
  databaseURL: "https://phong-tro-app-dc5bb-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);