import { useEffect, useState } from "react";

/**
 * Returns `false` during SSR/first render and `true` after the component
 * has mounted on the client.
 *
 * Used to avoid baking `opacity: 0` (or other "hidden" initial states) from
 * Framer Motion's `initial` prop directly into prerendered/SSR HTML — which
 * would make content invisible to crawlers that don't execute JS.
 *
 * Usage:
 * ```jsx
 * const isMounted = useIsMounted();
 * <motion.div
 *   initial={isMounted ? { opacity: 0, y: 24 } : false}
 *   animate={{ opacity: 1, y: 0 }}
 * />
 * ```
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
