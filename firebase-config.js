// =========================================================
// FIREBASE CONFIG
// =========================================================

const firebaseConfig = {
  apiKey: "AIzaSyDVKceCHZvh7AnxLYfn40Vb5zYZjmKnWts",
  authDomain: "janani-sangsad-31248.firebaseapp.com",
  projectId: "janani-sangsad-31248",
  storageBucket: "janani-sangsad-31248.firebasestorage.app",
  messagingSenderId: "935446853375",
  appId: "1:935446853375:web:a04618bae050e4090b7eca"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const db = firebase.firestore();
const auth = firebase.auth();