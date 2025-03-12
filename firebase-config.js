// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCU9Qg49gLZTjwkdKXCuDGNFfHT-r3TNbw",
  authDomain: "forca-a842a.firebaseapp.com",
  databaseURL: "https://forca-a842a-default-rtdb.firebaseio.com",
  projectId: "forca-a842a",
  storageBucket: "forca-a842a.firebasestorage.app",
  messagingSenderId: "193655210620",
  appId: "1:193655210620:web:d9e031a1bf40c757927ff9",
  measurementId: "G-G9WJMEKCFH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }; 