/**
 * JSON-LD schema builders shared by feature pages (/features/*, /ea-sync,
 * /business-score). Kept in src/lib so FeaturePageShared.jsx can stay
 * component-only for React Fast Refresh.
 */

/** Builds a FAQPage JSON-LD schema string from a faqs array. */
export const buildFaqSchema = (faqs) =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  });

/** Builds a BreadcrumbList JSON-LD schema string from an items array of { label, href }. */
export const buildBreadcrumbSchema = (items) =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://kraviq.app${item.href}` } : {}),
    })),
  });

/** Builds a WebPage JSON-LD schema string. */
export const buildWebPageSchema = ({ name, description, url }) =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "Kraviq",
      url: "https://kraviq.app",
    },
  });
