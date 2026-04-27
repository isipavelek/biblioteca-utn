import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyChuyWy1g38RIQokvJvPZqWl0u-jxv_E10",
  authDomain: "biblioteca-est-utn.firebaseapp.com",
  projectId: "biblioteca-est-utn",
  storageBucket: "biblioteca-est-utn.firebasestorage.app",
  messagingSenderId: "220047831852",
  appId: "1:220047831852:web:aa92a33d88f9bcc4a63289",
  measurementId: "G-2TYT37HCK3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
