

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBR2yGPjYu_l0MaHSnLEhW1XcKjeI3pkWg",
  authDomain: "smart-card-4b039.firebaseapp.com",
  projectId: "smart-card-4b039",
  storageBucket: "smart-card-4b039.firebasestorage.app",
  messagingSenderId: "675731259664",
  appId: "1:675731259664:web:f7fea51c09dba6bd512595",
  measurementId: "G-D6SBF1PMX6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Export instances
export { db, auth };