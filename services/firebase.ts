
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, doc, updateDoc, deleteDoc, increment, arrayUnion, arrayRemove, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBD4BM2SX2RRDpo_g2U7tpaaoQfNBHMPt4",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "dini-plus.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "dini-plus",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "dini-plus.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "793903822853",
  appId: env.VITE_FIREBASE_APP_ID || "1:793903822853:web:a38537f7cdf78daad2c46c",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-V1PN6XV8P4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);
// Initialize Firebase Auth
const auth = getAuth(app);

export { 
  db, 
  storage, 
  auth,
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  deleteDoc, 
  increment, 
  arrayUnion, 
  arrayRemove, 
  setDoc,
  getDoc,
  ref, 
  uploadString, 
  getDownloadURL,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
};
