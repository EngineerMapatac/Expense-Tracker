// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrLMFITxHACl7aI-6Eda2MoSdVF228iMs",
  authDomain: "budget-tracker-73242.firebaseapp.com",
  projectId: "budget-tracker-73242",
  storageBucket: "budget-tracker-73242.firebasestorage.app",
  messagingSenderId: "1007894512742",
  appId: "1:1007894512742:web:c9cac7a2dc1dd937a999a7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

db.enablePersistence().catch(err => {
  console.warn('Persistence error:', err);
});
