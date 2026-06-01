import {
  LegalLayout,
  LegalSection,
  LegalSubSection,
  LegalList,
  LegalNote,
} from "@/components/landing/LegalLayout";

export const DataPolicy = () => (
  <LegalLayout
    title="Privacy Policy"
    lastUpdated="June 1, 2026"
    description="How Tradecore collects, uses, and protects your personal information."
  >
    {/* Intro */}
    <LegalSection id="introduction" title="1. Introduction">
      <p className="text-sm">
        Tradecore ("<strong className="text-foreground">we</strong>", "
        <strong className="text-foreground">us</strong>", "
        <strong className="text-foreground">our</strong>") operates the
        Tradecore platform — a trading journal and business-management tool for
        retail forex traders. This Privacy Policy explains what personal data we
        collect, why we collect it, how we use it, and the choices you have.
      </p>
      <p className="text-sm">
        By creating an account or using any part of Tradecore, you agree to the
        practices described in this policy. If you do not agree, please do not
        use the platform.
      </p>
      <LegalNote>
        Tradecore is a trading journal platform. We do not provide financial
        advice, manage funds, or execute trades on your behalf.
      </LegalNote>
    </LegalSection>

    {/* Data we collect */}
    <LegalSection id="data-collected" title="2. Information We Collect">
      <LegalSubSection title="2.1 Account Information">
        <p className="text-sm">
          When you register, we collect the information you provide through
          Firebase Authentication:
        </p>
        <LegalList
          items={[
            "Email address",
            "Display name (if provided)",
            "Password (stored as a secure hash by Firebase — we never see it in plain text)",
            "Profile photo URL (optional, if you link a Google account)",
          ]}
        />
      </LegalSubSection>

      <LegalSubSection title="2.2 Trading Data">
        <p className="text-sm">
          The core of Tradecore is your trading journal. We store:
        </p>
        <LegalList
          items={[
            "Trading accounts you create (name, broker, account type, balance)",
            "Trades you log manually, import via CSV, or sync via the Expert Advisor (EA) — including pair, direction, entry/exit prices, P&L, timestamps, and any notes or tags you add",
            "Financial transactions you record (deposits, withdrawals, fees, swap costs, commissions)",
            "Prop firm challenge configuration (rules, targets, drawdown limits you enter)",
            "Business Score pillar data derived from your trade history",
            "EA synchronisation logs (last sync time, trade counts, connection status)",
          ]}
        />
      </LegalSubSection>

      <LegalSubSection title="2.3 Usage & Technical Data">
        <p className="text-sm">
          We automatically collect limited technical data when you use the
          platform:
        </p>
        <LegalList
          items={[
            "Browser type and version",
            "Operating system",
            "IP address (used for fraud detection and security)",
            "Pages and features accessed, and timestamps of those accesses",
            "Error logs and crash reports",
          ]}
        />
      </LegalSubSection>

      <LegalSubSection title="2.4 EA (Expert Advisor) Data">
        <p className="text-sm">
          If you install the Tradecore EA on your MetaTrader 4 or MT5 terminal,
          the EA sends trade data to our servers using a unique API key you
          generate. Data transmitted includes:
        </p>
        <LegalList
          items={[
            "Trade open/close events (pair, lots, direction, price, time)",
            "Account balance snapshots at trade close",
            "Broker name and server identifier",
          ]}
        />
        <p className="text-sm">
          Your EA API key is generated once and shown to you only at creation.
          We store a hashed version — we cannot recover or display it again.
        </p>
      </LegalSubSection>

      <LegalSubSection title="2.5 Cookies & Local Storage">
        <p className="text-sm">
          We use cookies and browser local storage for authentication sessions
          and user preferences. See our{" "}
          <a href="/cookies" className="text-primary underline underline-offset-2">
            Cookie Policy
          </a>{" "}
          for full details.
        </p>
      </LegalSubSection>
    </LegalSection>

    {/* How we use data */}
    <LegalSection id="how-we-use" title="3. How We Use Your Information">
      <LegalList
        items={[
          "Providing and maintaining the Tradecore platform and all its features",
          "Calculating your Trading Business Score and pillar breakdowns",
          "Enabling EA trade synchronisation to your accounts",
          "Sending system notifications (trade sync alerts, drawdown warnings, security events)",
          "Responding to support requests",
          "Improving the platform based on aggregated, anonymised usage patterns",
          "Enforcing our Terms of Service and preventing abuse",
          "Meeting legal and regulatory obligations",
        ]}
      />
      <LegalNote>
        We do not sell your personal data or trading data to any third party.
        We do not use your data for advertising profiling.
      </LegalNote>
    </LegalSection>

    {/* Data sharing */}
    <LegalSection id="data-sharing" title="4. Data Sharing & Third Parties">
      <p className="text-sm">
        We share your data only with the following sub-processors, each of
        which is bound by appropriate data protection agreements:
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">
                Provider
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">
                Purpose
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">
                Data Shared
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              {
                p: "Google Firebase",
                u: "Authentication & identity management",
                d: "Email, password hash, display name",
              },
              {
                p: "Render / Cloud Hosting",
                u: "Backend API hosting",
                d: "All data in transit and at rest",
              },
              {
                p: "MongoDB Atlas",
                u: "Database storage",
                d: "All structured data (accounts, trades, transactions)",
              },
            ].map((r) => (
              <tr key={r.p} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-foreground font-medium">{r.p}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.u}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm">
        We may disclose your information if required by law, court order, or
        governmental authority, or to protect the rights, property, or safety of
        Tradecore, our users, or the public.
      </p>
    </LegalSection>

    {/* Retention */}
    <LegalSection id="retention" title="5. Data Retention">
      <LegalList
        items={[
          "Account data — retained for as long as your account is active, then deleted within 30 days of account deletion",
          "Trade and transaction data — retained for the life of your account; exported copies are yours to keep",
          "System notifications — automatically expire and delete after 30 days",
          "Error logs and security logs — retained for up to 90 days",
          "Backups — encrypted database backups may retain data for up to 30 additional days after deletion",
        ]}
      />
    </LegalSection>

    {/* Your rights */}
    <LegalSection id="your-rights" title="6. Your Rights">
      <p className="text-sm">
        Depending on your location, you may have the following rights regarding
        your personal data:
      </p>
      <LegalList
        items={[
          "Access — request a copy of the personal data we hold about you",
          "Correction — ask us to correct inaccurate or incomplete data",
          "Deletion — request deletion of your account and associated data",
          "Export — download your trade data in CSV format at any time from the Import/Export settings",
          "Objection — object to certain types of processing",
          "Restriction — ask us to temporarily restrict processing of your data",
        ]}
      />
      <p className="text-sm">
        To exercise any of these rights, contact us at{" "}
        <a
          href="mailto:privacy@tradecore.app"
          className="text-primary underline underline-offset-2"
        >
          privacy@tradecore.app
        </a>
        . We will respond within 30 days.
      </p>
    </LegalSection>

    {/* Security */}
    <LegalSection id="security" title="7. Security">
      <p className="text-sm">
        We implement industry-standard security measures including:
      </p>
      <LegalList
        items={[
          "TLS/HTTPS encryption for all data in transit",
          "Encrypted storage of sensitive credentials",
          "Firebase Authentication for secure identity management — we never store plain-text passwords",
          "API keys stored as cryptographic hashes and shown only once at creation",
          "Regular security reviews of our backend infrastructure",
        ]}
      />
      <p className="text-sm">
        No method of transmission or storage is 100% secure. If you believe
        your account has been compromised, contact us immediately and change
        your password via the Settings page.
      </p>
    </LegalSection>

    {/* Children */}
    <LegalSection id="children" title="8. Children's Privacy">
      <p className="text-sm">
        Tradecore is not directed at children under the age of 18. We do not
        knowingly collect personal information from minors. If you believe a
        minor has created an account, please contact us and we will delete it
        promptly.
      </p>
    </LegalSection>

    {/* Changes */}
    <LegalSection id="changes" title="9. Changes to This Policy">
      <p className="text-sm">
        We may update this Privacy Policy from time to time. When we make
        material changes, we will notify you via email or a prominent notice
        within the app at least 7 days before the changes take effect. The "Last
        updated" date at the top of this page reflects the most recent revision.
        Continued use of Tradecore after changes take effect constitutes your
        acceptance of the updated policy.
      </p>
    </LegalSection>

    {/* Contact */}
    <LegalSection id="contact" title="10. Contact Us">
      <p className="text-sm">
        If you have questions, concerns, or requests regarding this Privacy
        Policy, contact us at:
      </p>
      <div className="bg-card border border-border rounded-xl p-5 text-sm space-y-1">
        <p className="text-foreground font-medium">Tradecore</p>
        <p>
          Email:{" "}
          <a
            href="mailto:privacy@tradecore.app"
            className="text-primary underline underline-offset-2"
          >
            privacy@tradecore.app
          </a>
        </p>
        <p>
          Support:{" "}
          <a
            href="mailto:support@tradecore.app"
            className="text-primary underline underline-offset-2"
          >
            support@tradecore.app
          </a>
        </p>
      </div>
    </LegalSection>
  </LegalLayout>
);
