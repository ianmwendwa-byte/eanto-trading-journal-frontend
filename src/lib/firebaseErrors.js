export const getFirebaseErrorMessage = (code) => {
  const messages = {
    "auth/user-not-found":        "No account found with this email",
    "auth/wrong-password":        "Incorrect password",
    "auth/email-already-in-use":  "An account with this email already exists",
    "auth/weak-password":         "Password must be at least 8 characters",
    "auth/invalid-email":         "Invalid email address",
    "auth/too-many-requests":     "Too many attempts. Try again later",
    "auth/network-request-failed":"Network error. Check your connection",
    "auth/user-disabled":         "This account has been disabled",
    "auth/invalid-credential":    "Invalid email or password",
    "auth/requires-recent-login": "Please sign in again to continue",
  };
  return messages[code] ?? "An error occurred. Please try again";
};
