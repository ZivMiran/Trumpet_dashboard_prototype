import { useEffect, useRef, useState } from 'react';

/* Delayed unmount for drawers/modals so their exit animations can play.
   Overlays here derive visibility from app state and clear that state on
   close — `latched` holds the last non-null value so the panel can keep
   rendering its content while the *-out animation runs (exit keyframes
   live in index.css; each overlay's CSS maps them to a --closing class).

   `ms` outlasts the 0.15s exit animations slightly; `forwards` fill on
   the keyframes holds the hidden end state until unmount. */
/* Close an overlay on Escape while it's open. Pass `active: false` when
   another overlay is stacked above it, so Esc only peels the topmost layer. */
export function useEscClose(active: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);
}

export function useOverlayExit<T>(value: T | null | undefined, ms = 180) {
  const open = value != null;
  const lastRef = useRef(value);
  if (open) lastRef.current = value;

  const [mounted, setMounted] = useState(open);
  // Adjust-during-render so a fresh open shows the panel the same frame.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open || !mounted) return;
    const t = window.setTimeout(() => setMounted(false), ms);
    return () => window.clearTimeout(t);
  }, [open, mounted, ms]);

  return { mounted, closing: mounted && !open, latched: lastRef.current };
}
