import { initializeApp } from "firebase/app";
import { getDatabase, push, ref, set } from "firebase/database";
import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

async function writeReview(
  comment: string,
  id: string,
  name: string,
  totalPositiveStars: number,
  timestamp: number,
) {
  const reference = ref(database, "reviews");
  const newReviewRef = push(reference);
  await set(newReviewRef, { comment, id, name, totalPositiveStars, timestamp });
}

async function writeReviewToFirestore(
  comment: string,
  name: string,
  totalPositiveStars: number,
  timestamp: number,
) {
  const docRef = await addDoc(collection(firestore, "reviews"), {
    comment,
    name,
    totalPositiveStars,
    createdAt: timestamp,
  });
  console.log("Review added to Firestore with ID:", docRef.id);
}

export {
  auth,
  googleProvider,
  addDoc,
  collection,
  database,
  firestore,
  getDocs,
  writeReview,
  writeReviewToFirestore,
};
