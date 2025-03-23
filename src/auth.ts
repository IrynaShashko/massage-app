import { signInWithPopup, signOut } from "firebase/auth";
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

export const handleLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
