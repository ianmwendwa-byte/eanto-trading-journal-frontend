import { useEffect, useRef } from "react";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedNumber = ({
  value,
  prefix   = "",
  suffix   = "",
  decimals = 2,
  duration = 1.0,
  className = "",
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (value === null || value === undefined) return;

    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent =
            `${prefix}${latest.toFixed(decimals)}${suffix}`;
        }
      },
    });

    return () => controls.stop();
  }, [value, prefix, suffix, decimals, duration]);

  return (
    <span
      ref={ref}
      className={cn("font-mono tabular-nums", className)}
    >
      {prefix}{(0).toFixed(decimals)}{suffix}
    </span>
  );
};
