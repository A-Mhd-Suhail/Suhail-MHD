import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve firebase config dynamically to hide keys from source code
app.get('/js/firebase-config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`
// ============================================================
//  CARE VAULT — FIREBASE CONFIG (COMPAT SDK)
//  Served dynamically from environment variables
// ============================================================

const firebaseConfig = {
  apiKey: "${process.env.FIREBASE_API_KEY || ''}",
  authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
  projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
  storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
  messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
  appId: "${process.env.FIREBASE_APP_ID || ''}",
  measurementId: "${process.env.FIREBASE_MEASUREMENT_ID || ''}"
};

try {
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
} catch(e) {
  console.warn('Firebase init:', e.message);
}

const auth = (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) ? firebase.auth() : {
  onAuthStateChanged: (cb) => { setTimeout(() => cb(null), 0); return () => {}; },
  signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase Auth is not configured.")),
  createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase Auth is not configured.")),
  sendPasswordResetEmail: () => Promise.reject(new Error("Firebase Auth is not configured.")),
  signOut: () => Promise.resolve(),
  setPersistence: () => Promise.resolve()
};

const db = (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) ? firebase.firestore() : {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => ({}) }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      onSnapshot: (cb) => { setTimeout(() => cb({ exists: false, data: () => ({}) }), 0); return () => {}; }
    }),
    onSnapshot: (cb) => { setTimeout(() => cb({ docs: [] }), 0); return () => {}; },
    add: () => Promise.resolve(),
    where: function() { return this; }
  })
};
  `);
});

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
