import { useEffect, useRef } from "react";

export default function useDialogFocus(onClose) {
  const dialog = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const frame = requestAnimationFrame(() => dialog.current?.querySelector('button, input, textarea, [tabindex="0"]')?.focus());
    const onKey = (event) => {
      if (event.key === "Escape") { event.stopPropagation(); close.current?.(); }
      if (event.key !== "Tab" || !dialog.current) return;
      const items = [...dialog.current.querySelectorAll('button:not(:disabled), a[href], input, select, textarea, [tabindex="0"]')].filter(el => el.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.current.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", onKey); if (previous?.isConnected) previous.focus(); };
  }, []);
  return dialog;
}
