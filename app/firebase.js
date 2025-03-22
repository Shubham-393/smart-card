// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

export { db };