import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2ZaAs_4y-NkIDkevOQ-beEyidSQvUFrU",
  authDomain: "superagent-ff2fe.firebaseapp.com",
  projectId: "superagent-ff2fe",
  storageBucket: "superagent-ff2fe.firebasestorage.app",
  messagingSenderId: "561174706467",
  appId: "1:561174706467:web:ebbf628bb3d7f44c73f496",
  measurementId: "G-W2YWKR44P2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app; 