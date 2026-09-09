// ==========================================
// YUKESHWARAN YARN STORAGE SYSTEM
// SHARED FIREBASE CONFIGURATION
// ==========================================


// ==========================================
// FIREBASE APP
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


// ==========================================
// FIRESTORE
// ==========================================

import {
    getFirestore,
    collection,
    doc,
    getDocs,
    addDoc,
    setDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyAz3amIIIqVIwlRa5grCiuPRKHgGRMcUjQ",

    authDomain:
        "yarnstorage-34880.firebaseapp.com",

    projectId:
        "yarnstorage-34880",

    storageBucket:
        "yarnstorage-34880.firebasestorage.app",

    messagingSenderId:
        "291783506962",

    appId:
        "1:291783506962:web:df9359942ad3f75ba7accb",

    measurementId:
        "G-BMJFMP34N9"

};


// ==========================================
// INITIALIZE FIREBASE APP
// ==========================================

const app =
    initializeApp(
        firebaseConfig
    );


// ==========================================
// INITIALIZE FIRESTORE
// ==========================================

const db =
    getFirestore(
        app
    );
// ==========================================
// EXPORT FIREBASE + FIRESTORE
// ==========================================

export {

    db,

    collection,

    doc,

    getDocs,

    addDoc,

    setDoc,

    deleteDoc,

    query,

    where,

    serverTimestamp

};
