import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyAnt6VTUjGjjlToxv4-2ErDr4_yk3Fx8CY",
  authDomain: "authentication-f5ced.firebaseapp.com",
  projectId: "authentication-f5ced",
  storageBucket: "authentication-f5ced.appspot.com",
  messagingSenderId: "291138097193",
  appId: "1:291138097193:web:1b5251f6a99dc1391a0c38",
  measurementId: "G-B9DLYN4JDS"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);