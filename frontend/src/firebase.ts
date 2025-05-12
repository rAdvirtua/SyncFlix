import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCZ-dU3Nm2Y60KXiL0YaGOtCRlvljZkSAQ",
  authDomain: "syncflix-411f4.firebaseapp.com",
  projectId: "syncflix-411f4",
  storageBucket: "syncflix-411f4.firebasestorage.app",
  messagingSenderId: "949334744272",
  appId: "1:949334744272:web:8d381843c5419bbdb592d5",
  measurementId: "G-NJ41JGG5M4"
};

// IMPORTANT: Make sure you've enabled Google Authentication in the Firebase Console
// Go to Authentication > Sign-in methods > Google > Enable

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
