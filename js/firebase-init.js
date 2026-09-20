// ─────────────────────────────────────────────────────────────
// js/firebase-init.js — เชื่อมต่อ Firebase project: leaveeasy-nammon
// โหลดเป็น <script type="module"> ก่อนไฟล์อื่นทุกไฟล์ในทุกหน้า
// ผูกของที่ใช้บ่อยไว้ที่ window เพื่อให้ไฟล์ .js แบบเดิม (ไม่ใช่ module) เรียกใช้ได้ตรงๆ
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjNnrzcXPb4PE9gm2-PgUIkVzU4OLrYL8",
  authDomain: "leaveeasy-nammon.firebaseapp.com",
  projectId: "leaveeasy-nammon",
  storageBucket: "leaveeasy-nammon.firebasestorage.app",
  messagingSenderId: "861872630670",
  appId: "1:861872630670:web:31a0fefeffcbc8f19b12df"
};

const app = initializeApp(firebaseConfig);

window.db = getFirestore(app);
window.auth = getAuth(app);

// ทุกหน้าเรียกใช้ผ่าน window.fb.xxx(...) ได้เลย ไม่ต้องเขียน import เอง
window.fb = {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp,
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut
};

// แจ้งไฟล์อื่นว่า Firebase พร้อมใช้แล้ว (ไฟล์ปกติที่ไม่ใช่ module ต้องรอ event นี้)
window.dispatchEvent(new Event("firebase-พร้อมใช้"));
