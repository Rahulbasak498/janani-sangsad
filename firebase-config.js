// =========================================================
// FIREBASE CONFIG
// =========================================================
// Firebase Console (console.firebase.google.com) -> আপনার প্রজেক্ট
// -> ⚙️ Project settings -> General -> "Your apps" -> Web app (</>)
// থেকে এই তথ্যগুলো কপি করে নিচে বসান।
//
// SETUP-GUIDE.md ফাইলে ধাপে ধাপে নির্দেশনা দেওয়া আছে।
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
const app = initializeApp(firebaseConfig);