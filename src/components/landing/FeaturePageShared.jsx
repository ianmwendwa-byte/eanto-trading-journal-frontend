import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reveal } from "@/lib/animations";
import { useIsMounted } from "@/hooks/useIsMounted";

/**
 * Breadcrumb trail for feature pages.
 * `items` is an array of { label, href? } — the last item has no href (current page).
 */
export const FeatureBreadcrumb = ({ items }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
    {items.map((item, i) => (
      <span key={item.label} className="flex items-center gap-1.5">
        {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />}
        {item.href ? (
          <Link to={item.href} className="hover:text-foreground transition-colors">
            {item.label}
          </Link>
        ) : (
          <span className="text-foreground" aria-current="page">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

/**
 * FAQ section with plain Q&A blocks (matches brand voice — direct, no embellishment).
 * `faqs` is an array of { question, answer }.
 */
export const FeatureFAQ = ({ faqs, eyebrowColor = "text-primary" }) => {
  const isMounted = useIsMounted();
  return (
  <section className="py-20 border-t border-border">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <motion.p {...reveal(0, isMounted)} className={`text-xs uppercase tracking-widest font-medium mb-4 ${eyebrowColor}`}>
          Questions
        </motion.p>
        <motion.h2 {...reveal(0.05, isMounted)} className="font-heading font-bold text-3xl md:text-4xl text-foreground">
          Frequently asked questions
        </motion.h2>
      </div>
      <div className="space-y-5">
        {faqs.map((item, i) => (
          <motion.div
            key={item.question}
            initial={isMounted ? { opacity: 0, y: 16 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="font-heading font-semibold text-base text-foreground mb-2">
              {item.question}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

/**
 * Related features card row. `items` is an array of { title, description, href }.
 */
export const RelatedFeatures = ({ items }) => {
  const isMounted = useIsMounted();
  return (
  <section className="py-20 border-t border-border">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <motion.p {...reveal(0, isMounted)} className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
          Related
        </motion.p>
        <motion.h2 {...reveal(0.05, isMounted)} className="font-heading font-bold text-3xl md:text-4xl text-foreground">
          Other parts of the system
        </motion.h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {items.map((item, i) => (
          <motion.div
            key={item.href}
            initial={isMounted ? { opacity: 0, y: 24 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
          >
            <Link
              to={item.href}
              className="block h-full bg-card border border-border rounded-2xl p-6 hover:border-primary/40 transition-colors group"
            >
              <h3 className="font-heading font-semibold text-base text-foreground mb-2 flex items-center justify-between">
                {item.title}
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

/**
 * Closing CTA banner — consistent across all feature pages.
 */
export const FeatureCTABanner = ({ heading, subtext = "Start free. No card required." }) => {
  const isMounted = useIsMounted();
  return (
  <section className="py-20 border-t border-border">
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.h2 {...reveal(0, isMounted)} className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
        {heading}
      </motion.h2>
      <motion.p {...reveal(0.05, isMounted)} className="text-muted-foreground mb-8">
        {subtext}
      </motion.p>
      <motion.div {...reveal(0.1, isMounted)}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
          <Button size="lg" asChild className="gap-2">
            <Link to="/register">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  </section>
  );
};
