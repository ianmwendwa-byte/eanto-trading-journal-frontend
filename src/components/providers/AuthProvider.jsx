import { useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { API } from "@/constants/api";

export const AuthProvider = ({ children }) => {
  const { setFirebaseUser, setMongoUser, setOnboardingComplete, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        try {
          const response = await api.post(API.AUTH.LOGIN, {
            displayName: firebaseUser.displayName ?? "",
            photoURL:    firebaseUser.photoURL    ?? "",
          });
          setMongoUser(response.user);
          setOnboardingComplete(response.onboardingComplete);
          
        } catch (error) {
          if (error.status === 401) {
            await signOut(auth);
            logout();
          } else {
            console.error("Backend sync failed:", error);
            setMongoUser(null);
          }
        }
      } else {
        logout();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return children;
};
