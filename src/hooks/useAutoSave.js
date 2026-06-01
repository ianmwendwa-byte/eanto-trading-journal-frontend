import { useState, useCallback, useEffect, useRef } from "react";

export const useAutoSave = ({
  mutationFn,
  debounceMs = 800,
  onSuccess,
  onError,
}) => {
  const [status, setStatus]   = useState("idle");
  const [error,  setError]    = useState(null);
  const timerRef              = useRef(null);
  const savedTimerRef         = useRef(null);

  const save = useCallback(
    (data) => {
      setStatus("saving");
      setError(null);

      if (timerRef.current)      clearTimeout(timerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

      timerRef.current = setTimeout(async () => {
        try {
          await mutationFn(data);
          setStatus("saved");
          onSuccess?.();
          savedTimerRef.current = setTimeout(() => setStatus("idle"), 2000);
        } catch (err) {
          setStatus("error");
          setError(err?.message ?? "Failed to save changes");
          onError?.(err);
        }
      }, debounceMs);
    },
    [mutationFn, debounceMs, onSuccess, onError]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current)      clearTimeout(timerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  return {
    save,
    status,
    error,
    isDirty: status === "saving",
  };
};
