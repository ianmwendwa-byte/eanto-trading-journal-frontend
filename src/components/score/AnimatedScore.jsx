import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedScore = ({ score, className, style }) => {
  const ref          = useRef(null);
  const motionValue  = useMotionValue(0);
  const springValue  = useSpring(motionValue, { duration: 1500, bounce: 0 });
  const isInView     = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView && score != null) motionValue.set(score);
  }, [isInView, score, motionValue]);

  useEffect(() => {
    return springValue.on("change", (v) => setDisplay(Math.round(v)));
  }, [springValue]);

  return (
    <span ref={ref} className={cn(className)} style={style}>
      {score == null ? "—" : display}
    </span>
  );
};
