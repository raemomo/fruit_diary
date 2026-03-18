import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-brLT8mgDmvfBB2fnHcZqji4lv6JKWjA",
  authDomain: "fruit-diary-d3657.firebaseapp.com",
  projectId: "fruit-diary-d3657",
  storageBucket: "fruit-diary-d3657.firebasestorage.app",
  messagingSenderId: "619465026615",
  appId: "1:619465026615:web:3d52c1ba388706a68de3b2",
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");