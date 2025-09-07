import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCttQMbSYoZFiLnBYGL-IC1woDsobCkdUE",
  authDomain: "wecoinvisors-b4f67.firebaseapp.com",
  projectId: "wecoinvisors-b4f67",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
