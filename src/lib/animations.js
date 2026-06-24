export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0, y: -8,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const fadeVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export const slideRightVariants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1, x: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0, x: 20,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const slideUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0, y: 20,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1, scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0, scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const staggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren:   0.1,
    },
  },
};

export const staggerItemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

/**
 * Scroll-triggered reveal used across marketing/feature pages
 * (fade up + slide, fires once when scrolled into view).
 */
export const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut", delay },
});
