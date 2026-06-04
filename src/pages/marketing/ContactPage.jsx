import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageSquare, Clock, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageLayout } from "@/components/landing/PageLayout";

const schema = z.object({
  name:    z.string().min(2, "Name must be at least 2 characters"),
  email:   z.string().email("Enter a valid email address"),
  subject: z.string().min(4, "Subject must be at least 4 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

const TOPICS = [
  { label: "General inquiry",    email: "hello@kraviq.app" },
  { label: "Technical support",  email: "support@kraviq.app" },
  { label: "Billing question",   email: "billing@kraviq.app" },
  { label: "Data / privacy",     email: "privacy@kraviq.app" },
];

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, ease: "easeOut", delay },
});

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-card border border-border rounded-2xl p-10 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-5">
          <Check className="h-7 w-7 text-success" aria-hidden="true" />
        </div>
        <h3 className="font-heading font-bold text-xl text-foreground mb-2">
          Message received
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Thanks for reaching out. We aim to reply within 24 hours on business
          days.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5"
      noValidate
    >
      <h2 className="font-heading font-bold text-xl text-foreground mb-1">
        Send a message
      </h2>
      <p className="text-sm text-muted-foreground">
        We read every message and reply within 24 hours on business days.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            placeholder="Your name"
            autoComplete="name"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p role="alert" className="text-xs text-danger mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p role="alert" className="text-xs text-danger mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="What is your message about?"
          {...register("subject")}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && (
          <p role="alert" className="text-xs text-danger mt-1">
            {errors.subject.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Describe your question or feedback in detail…"
          {...register("message")}
          aria-invalid={!!errors.message}
          className="resize-none"
        />
        {errors.message && (
          <p role="alert" className="text-xs text-danger mt-1">
            {errors.message.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : (
          <>
            Send Message
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};

export const ContactPage = () => (
  <PageLayout title="Contact">

    {/* Header */}
    <section className="relative pt-32 pb-16 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(23,61,237,0.09), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p {...reveal(0)} className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
          Contact
        </motion.p>
        <motion.h1
          {...reveal(0.05)}
          className="font-heading font-bold text-5xl md:text-6xl text-foreground mb-4"
        >
          Get in touch
        </motion.h1>
        <motion.p {...reveal(0.1)} className="text-lg text-muted-foreground">
          A question, a bug, a feature idea, or just want to say hello — we
          read everything.
        </motion.p>
      </div>
    </section>

    {/* Main grid */}
    <section className="pb-24 border-t border-border pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-[1fr_320px] gap-10 items-start">

          {/* Left — form */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ContactForm />
          </motion.div>

          {/* Right — info */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="space-y-5"
          >
            {/* Response time */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-foreground">
                  Response time
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We aim to reply within <strong className="text-foreground">24 hours</strong> on
                weekdays. Complex technical issues may take a little longer.
              </p>
            </div>

            {/* Email contacts */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-foreground">
                  Email us directly
                </h3>
              </div>
              <ul className="space-y-3" aria-label="Contact email addresses">
                {TOPICS.map((t) => (
                  <li key={t.label}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                      {t.label}
                    </p>
                    <a
                      href={`mailto:${t.email}`}
                      className="text-sm text-primary hover:underline underline-offset-2"
                    >
                      {t.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-foreground">
                  Community
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Join the community for faster answers from other traders and
                early access to new features.
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="/community">Join the community →</a>
              </Button>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>

  </PageLayout>
);
