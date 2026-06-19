import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { API } from "@/constants/api";

/**
 * Hook for resending email verification via the backend.
 * Uses POST /auth/resend-verification (Firebase JWT required).
 *
 * status values:
 *   'idle' | 'loading' | 'success' | 'already-verified' | 'rate-limited' | 'error'
 */
export const useResendVerification = () => {
  const [status,    setStatus]    = useState("idle");
  const [countdown, setCountdown] = useState(0);

  const resend = async (idToken) => {
    setStatus("loading");
    try {
      await api.post(
        API.AUTH.RESEND_VERIFICATION,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setStatus("success");
      setCountdown(60);
    } catch (err) {
      const status = err.status ?? err.response?.status;
      if (status === 400) {
        setStatus("already-verified");
      } else if (status === 429) {
        setStatus("rate-limited");
        setCountdown(60);
      } else {
        setStatus("error");
      }
    }
  };

  // Countdown timer — ticks every second while countdown > 0
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return { resend, status, countdown };
};
