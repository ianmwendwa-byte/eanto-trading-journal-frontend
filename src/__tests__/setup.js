import "@testing-library/jest-dom";

// Polyfill IntersectionObserver for jsdom (used by TableOfContents)
if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
