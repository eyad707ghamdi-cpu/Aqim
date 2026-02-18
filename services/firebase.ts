
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, doc, updateDoc, deleteDoc, increment, arrayUnion, arrayRemove, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBD4BM2SX2RRDpo_g2U7tpaaoQfNBHMPt4",
  authDomain: "dini-plus.firebaseapp.com",
  projectId: "dini-plus",
  storageBucket: "dini-plus.firebasestorage.app",
  messagingSenderId: "793903822853",
  appId: "1:793903822853:web:a38537f7cdf78daad2c46c",
  measurementId: "G-V1PN6XV8P4"
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
