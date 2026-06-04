import { motion } from "framer-motion";
import { Wallet, TrendingUp, Calculator, Star } from "lucide-react";

// ── Node ─────────────────────────────────────────────────────────────────────
// Uses border + bg to highlight — no scale() transforms that bleed outside layout box

const FlowNode = ({ icon: Icon, label, value, highlight, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, ease: "easeOut", delay }}
    className={`flex flex-col items-center text-center rounded-2xl p-4 border ${
      highlight
        ? "bg-primary/5 border-primary/40"
        : "bg-background border-border"
    }`}
  >
    <div
      className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-3 flex-shrink-0 ${
        highlight
          ? "bg-primary/10 border-primary/30"
          : "bg-card border-border"
      }`}
    >
      <Icon
        className={`h-5 w-5 ${
          highlight ? "text-primary" : "text-muted-foreground"
        }`}
        aria-hidden="true"
      />
    </div>

    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 whitespace-nowrap">
      {label}
    </p>

    <p
      className={`font-mono font-bold text-base whitespace-nowrap ${
        value.startsWith("+")
          ? "text-success"
          : value.startsWith("-")
          ? "text-danger"
          : "text-foreground"
      }`}
    >
      {value}
    </p>

    {highlight && (
      <p className="text-[10px] text-primary mt-1 font-medium whitespace-nowrap">
        What you actually made
      </p>
    )}
  </motion.div>
);

// ── Arrow connector ───────────────────────────────────────────────────────────
// Sits in its own auto-width grid column — never overlaps nodes

const FlowArrow = ({ label, costs, delay }) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, ease: "easeOut", delay }}
    className="flex flex-col items-center justify-center gap-0.5 px-1 flex-shrink-0"
    aria-hidden="true"
  >
    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
      {label}
    </span>

    {costs &&
      costs.map((c, i) => (
        <span
          key={i}
          className="text-[9px] text-danger font-mono whitespace-nowrap"
        >
          {c}
        </span>
      ))}

    {/* Horizontal arrow line */}
    <div className="flex items-center mt-1">
      <div className="w-6 h-px bg-border" />
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        className="text-muted-foreground/50 flex-shrink-0"
        fill="currentColor"
      >
        <path d="M0 4 L6 1 L6 3 L8 3 L8 5 L6 5 L6 7 Z" />
      </svg>
    </div>
  </motion.div>
);

// ── Mobile step card ──────────────────────────────────────────────────────────

const MobileStep = ({ icon: Icon, label, value, highlight, connector, connectorCosts }) => (
  <div className="flex flex-col items-center w-full">
    {/* Node */}
    <div
      className={`w-full rounded-xl border p-4 flex items-center gap-4 ${
        highlight
          ? "bg-primary/5 border-primary/40"
          : "bg-background border-border"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${
          highlight ? "bg-primary/10 border-primary/30" : "bg-card border-border"
        }`}
      >
        <Icon
          className={`h-4 w-4 ${
            highlight ? "text-primary" : "text-muted-foreground"
          }`}
          aria-hidden="true"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p
          className={`font-mono font-bold text-base ${
            value.startsWith("+")
              ? "text-success"
              : value.startsWith("-")
              ? "text-danger"
              : "text-foreground"
          }`}
        >
          {value}
        </p>
        {highlight && (
          <p className="text-[10px] text-primary mt-0.5 font-medium">
            What you actually made
          </p>
        )}
      </div>
    </div>

    {/* Connector below (if any) */}
    {connector && (
      <div
        className="flex flex-col items-center py-2 gap-0.5"
        aria-hidden="true"
      >
        <div className="w-px h-3 bg-border" />
        <span className="text-[9px] text-muted-foreground">{connector}</span>
        {connectorCosts &&
          connectorCosts.map((c, i) => (
            <span key={i} className="text-[9px] text-danger font-mono">
              {c}
            </span>
          ))}
        <div className="w-px h-3 bg-border" />
        <svg
          width="8"
          height="6"
          viewBox="0 0 8 6"
          className="text-muted-foreground/50"
          fill="currentColor"
        >
          <path d="M4 6 L0 0 L8 0 Z" />
        </svg>
      </div>
    )}
  </div>
);

// ── Section ───────────────────────────────────────────────────────────────────

export const FinancialClaritySection = () => {
  return (
    <section
      className="py-24 md:py-32 border-t border-border"
      aria-labelledby="clarity-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-xs uppercase tracking-widest text-primary mb-4 font-medium"
          >
            Financial Clarity
          </motion.p>
          <motion.h2
            id="clarity-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4"
          >
            Do you know what you actually made?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Most traders confuse gross profit with real profit. Kraviq shows
            you the full picture — every cost, every withdrawal, every dollar.
          </motion.p>
        </div>

        {/* Flow diagram card */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-10 mb-8">

          {/* ── Desktop: CSS grid — nodes in 1fr cols, arrows in auto cols ── */}
          {/*    grid-cols pattern: node  arrow  node  arrow  node  arrow  node */}
          <div
            className="hidden md:grid items-center gap-y-2"
            style={{
              gridTemplateColumns:
                "1fr auto 1fr auto 1fr auto 1fr",
              columnGap: "0.75rem",
            }}
          >
            <FlowNode
              icon={Wallet}
              label="Capital In"
              value="$10,000"
              highlight={false}
              delay={0}
            />
            <FlowArrow label="trading" delay={0.1} />
            <FlowNode
              icon={TrendingUp}
              label="Gross P&L"
              value="+$2,400"
              highlight={false}
              delay={0.2}
            />
            <FlowArrow
              label="costs deducted"
              costs={["commission −$82", "swap −$12", "prop fee −$256"]}
              delay={0.3}
            />
            <FlowNode
              icon={Calculator}
              label="Net P&L"
              value="+$2,050"
              highlight={false}
              delay={0.4}
            />
            <FlowArrow label="withdrawals" delay={0.5} />
            <FlowNode
              icon={Star}
              label="True Net P&L"
              value="+$1,800"
              highlight={true}
              delay={0.6}
            />
          </div>

          {/* ── Mobile: vertical stack ── */}
          <motion.div
            className="flex md:hidden flex-col items-center w-full gap-0"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <MobileStep
              icon={Wallet}
              label="Capital In"
              value="$10,000"
              highlight={false}
              connector="trading"
            />
            <MobileStep
              icon={TrendingUp}
              label="Gross P&L"
              value="+$2,400"
              highlight={false}
              connector="costs deducted"
              connectorCosts={[
                "commission −$82",
                "swap −$12",
                "prop fee −$256",
              ]}
            />
            <MobileStep
              icon={Calculator}
              label="Net P&L"
              value="+$2,050"
              highlight={false}
              connector="withdrawals"
            />
            <MobileStep
              icon={Star}
              label="True Net P&L"
              value="+$1,800"
              highlight={true}
            />
          </motion.div>
        </div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
          className="text-sm text-muted-foreground italic text-center max-w-sm mx-auto"
        >
          TradeZella shows you P&L. Kraviq shows you the truth.
        </motion.p>
      </div>
    </section>
  );
};
