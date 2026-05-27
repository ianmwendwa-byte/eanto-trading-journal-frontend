import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const authState = useAuthStore();
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      authState.logout();
      queryClient.clear();
    }
  };

  return {
    firebaseUser: authState.firebaseUser,
    mongoUser: authState.mongoUser,
    isAuthenticated: authState.isAuthenticated,
    logout,
  };
};
