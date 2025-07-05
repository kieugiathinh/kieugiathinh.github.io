import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyA7F_aMoPHbsYQzAbi7qm6vnEnmoXGrQnw",
    authDomain: "learningwithgiathinh-37eb0.firebaseapp.com",
    projectId: "learningwithgiathinh-37eb0",
    storageBucket: "learningwithgiathinh-37eb0.firebasestorage.app",
    messagingSenderId: "77972767462",
    appId: "1:77972767462:web:4a90b813745266ec3db127",
    measurementId: "G-Y41D2HF1ZJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 