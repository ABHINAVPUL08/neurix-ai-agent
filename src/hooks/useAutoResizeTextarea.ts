"use client";

import { useCallback, useEffect } from "react";

const MAX_HEIGHT = 160;

export function useAutoResizeTextarea(
  value: string,
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
) {
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [textareaRef]);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return resize;
}
