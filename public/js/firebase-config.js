// ============================================================
//  CARE VAULT — FIREBASE CONFIG (COMPAT SDK)
//  NOTE: Do NOT use "import ..." statements here.
//  This app loads firebase-*-compat.js (global "firebase" object).
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBXdkeWIoIlMEa5DWIrE4yHuI_jHTeM1mo",
  authDomain: "every-life-matters-8aca8.firebaseapp.com",
  projectId: "every-life-matters-8aca8",
  storageBucket: "every-life-matters-8aca8.firebasestorage.app",
  messagingSenderId: "471031101690",
  appId: "1:471031101690:web:56f82fae6aa0287e787143",
  measurementId: "G-4K1CNF2MZ7"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();