import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDptTaACtEXHS81ZgwzeiA19o5a8JF-LrM",
  authDomain: "find-c10e1.firebaseapp.com",
  projectId: "find-c10e1",
  storageBucket: "find-c10e1.firebasestorage.app",
  messagingSenderId: "546204472032",
  appId: "1:546204472032:web:4e7bf1d404dc83966fb685",
  measurementId: "G-D320GR5FQ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export these for use in your components
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();