import { create } from "zustand";

export const useAuthStore = create((set) => ({
  firebaseUser:       null,
  mongoUser:          null,
  isLoading:          true,
  isAuthenticated:    false,
  onboardingComplete: null,

  setFirebaseUser: (firebaseUser) => set({
    firebaseUser,
    isAuthenticated: !!firebaseUser,
  }),
  setMongoUser:          (mongoUser)          => set({ mongoUser }),
  setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
  setLoading:            (isLoading)          => set({ isLoading }),
  logout: () => set({
    firebaseUser:       null,
    mongoUser:          null,
    isAuthenticated:    false,
    isLoading:          false,
    onboardingComplete: null,
  }),
}));
