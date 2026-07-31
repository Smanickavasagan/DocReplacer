import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';

// Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const addToWaitlist = async (name, email, docType) => {
  console.log("Attempting to add to waitlist...", { name, email, docType });
  console.log("Firebase config check:", {
    projectId: firebaseConfig.projectId,
    hasApiKey: !!firebaseConfig.apiKey
  });
  
  try {
    const docRef = await addDoc(collection(db, 'waitlist'), {
      name,
      email,
      docType,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    throw error;
  }
};

export const getWaitlist = async () => {
  try {
    const q = query(collection(db, 'waitlist'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    throw error;
  }
};
