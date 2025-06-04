// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3zkOqA5dCyhzgtHHXK8df-2LMhoED2mA",
  authDomain: "champcuts-1eb3a.firebaseapp.com",
  projectId: "champcuts-1eb3a",
  storageBucket: "champcuts-1eb3a.firebaseatorage.app",
  messagingSenderId: "882795075650",
  appId: "1:882795075650:web:582e36475f8f9b9c7a35db",
  measurementId: "G-LXHXNRMCZP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics }; 