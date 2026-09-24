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

// Add the public Web Push certificate key from Firebase Console > Cloud Messaging.
// This key is public and is required before visitors can subscribe to push notifications.
const firebaseVapidKey = '';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
