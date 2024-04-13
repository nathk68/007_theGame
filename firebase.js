// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXeC83m2SOcrVGDnTcrJ1RL3ICX_Mbl5o",
  authDomain: "game-aaa5a.firebaseapp.com",
  databaseURL: "https://game-aaa5a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "game-aaa5a",
  storageBucket: "game-aaa5a.appspot.com",
  messagingSenderId: "51775420809",
  appId: "1:51775420809:web:2cc309e76e277717e7c958",
  measurementId: "G-Q1J02MNXTV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export { db };