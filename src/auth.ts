import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Google sign-in successful:", user);
  } catch (error: any) {
    console.error("Google sign-in error:", error.message);
  }
};

export const checkAuthState = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User logged in:", user);
    } else {
      console.log("No user logged in");
    }
  });
};
