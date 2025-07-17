// utils/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCttQMbSYoZFiLnBYGL-IC1woDsobCkdUE",
  authDomain: "wecoinvisors-b4f67.firebaseapp.com",
  projectId: "wecoinvisors-b4f67",
  storageBucket: "wecoinvisors-b4f67.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:1234567890:web:abcdef123456",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
