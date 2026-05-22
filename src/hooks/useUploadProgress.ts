"use client";

import { useCallback, useRef, useState } from "react";

export function useUploadProgress() {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setProgress(0);
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    setProgress(5);
    timerRef.current = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.random() * 6 : p));
    }, 280);
  }, [clearTimer]);

  const complete = useCallback(() => {
    clearTimer();
    setProgress(100);
  }, [clearTimer]);

  return { progress, start, reset, complete };
}
