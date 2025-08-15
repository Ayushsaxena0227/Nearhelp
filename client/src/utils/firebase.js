import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCuaVtSTExoSfPE7V799Fd_KFrm-hSphRA",
  authDomain: "nearhelp-7f7af.firebaseapp.com",
  projectId: "nearhelp-7f7af",
  storageBucket: "nearhelp-7f7af.firebasestorage.app",
  messagingSenderId: "386090347515",
  appId: "1:386090347515:web:e2dbee67bcd9972309b95e",
  measurementId: "G-K7QWHJ2B4B",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
