// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPjCf-mHas2WQfe8Ztr5jJEwy-j8h9BA4",
  authDomain: "receptomat-705c6.firebaseapp.com",
  projectId: "receptomat-705c6",
  storageBucket: "receptomat-705c6.firebasestorage.app",
  messagingSenderId: "939800754071",
  appId: "1:939800754071:web:5a8fc6d691a19ba02676d2",
  measurementId: "G-2SZM57FW59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;