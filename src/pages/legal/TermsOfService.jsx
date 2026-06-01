import {
  LegalLayout,
  LegalSection,
  LegalSubSection,
  LegalList,
  LegalNote,
  LegalWarning,
} from "@/components/landing/LegalLayout";

export const TermsOfService = () => (
  <LegalLayout
    title="Terms of Service"
    lastUpdated="June 1, 2026"
    description="The rules and conditions that govern your use of Tradecore."
  >
    {/* Acceptance */}
    <LegalSection id="acceptance" title="1. Acceptance of Terms">
      <p className="text-sm">
        By creating an account on Tradecore or accessing any part of the
        platform, you agree to be bound by these Terms of Service ("Terms"),
        our{" "}
        <a href="/privacy" className="text-primary underline underline-offset-2">
          Privacy Policy
        </a>
        , and our{" "}
        <a href="/cookies" className="text-primary underline underline-offset-2">
          Cookie Policy
        </a>
        . If you do not agree to these Terms, you may not use the platform.
      </p>
      <p className="text-sm">
        These Terms constitute a legally binding agreement between you and
        Tradecore. We may update these Terms from time to time — continued use
        after changes are posted constitutes acceptance.
      </p>
    </LegalSection>

    {/* Disclaimer */}
    <LegalSection id="disclaimer" title="2. No Financial Advice">
      <LegalWarning>
        <strong>Important:</strong> Tradecore is a trading journal and
        performance-tracking platform. Nothing on Tradecore — including the
        Business Score, analytics, insights, or any other feature — constitutes
        financial advice, investment advice, or a recommendation to buy or sell
        any financial instrument. Trading forex and CFDs carries significant
        risk of loss and is not suitable for all investors. You are solely
        responsible for your trading decisions.
      </LegalWarning>
      <p className="text-sm">
        Past trading performance recorded in Tradecore does not guarantee or
        predict future results. The Business Score and all analytics are
        informational tools only.
      </p>
    </LegalSection>

    {/* Service description */}
    <LegalSection id="service" title="3. Description of Service">
      <p className="text-sm">
        Tradecore provides a web-based platform that enables retail forex traders
        to:
      </p>
      <LegalList
        items={[
          "Record, import, and automatically synchronise trading activity from MetaTrader 4 and MT5",
          "Manage multiple trading accounts (normal, prop firm challenge, and war/experimental accounts)",
          "Track prop firm challenge progress against firm-specific rules",
          "Calculate a Trading Business Score across five performance pillars",
          "Review financial transactions, net P&L, and cost breakdowns",
          "Access analytics and performance summaries",
        ]}
      />
      <p className="text-sm">
        We reserve the right to modify, suspend, or discontinue any feature of
        the platform at any time with reasonable notice to users.
      </p>
    </LegalSection>

    {/* Accounts */}
    <LegalSection id="accounts" title="4. Your Account">
      <LegalSubSection title="4.1 Registration">
        <p className="text-sm">
          You must provide accurate, current, and complete information when
          creating an account. You are responsible for maintaining the
          confidentiality of your credentials and for all activity that occurs
          under your account. Notify us immediately at{" "}
          <a
            href="mailto:support@tradecore.app"
            className="text-primary underline underline-offset-2"
          >
            support@tradecore.app
          </a>{" "}
          if you suspect unauthorised access.
        </p>
      </LegalSubSection>

      <LegalSubSection title="4.2 One Account Per Person">
        <p className="text-sm">
          Each individual may hold only one Tradecore account. Creating multiple
          accounts to circumvent plan limits or free-trial restrictions is a
          violation of these Terms.
        </p>
      </LegalSubSection>

      <LegalSubSection title="4.3 Account Security">
        <p className="text-sm">
          You are responsible for keeping your password secure. Tradecore uses
          Firebase Authentication — we never store or have access to your
          plain-text password. EA API keys are shown only once at generation and
          should be stored securely; treat them like passwords.
        </p>
      </LegalSubSection>
    </LegalSection>

    {/* Acceptable use */}
    <LegalSection id="acceptable-use" title="5. Acceptable Use">
      <p className="text-sm">You agree not to:</p>
      <LegalList
        items={[
          "Use the platform for any unlawful purpose or in violation of any regulations",
          "Attempt to reverse-engineer, decompile, or extract source code from the platform",
          "Introduce malware, viruses, or any harmful code",
          "Attempt to gain unauthorised access to other users' accounts or data",
          "Use automated scripts or bots to access the platform other than our official EA integration",
          "Resell, sublicense, or commercially exploit the platform without written permission",
          "Impersonate any person or entity or misrepresent your affiliation with any person",
          "Violate the integrity or security of any network or system",
        ]}
      />
      <LegalNote>
        The Tradecore Expert Advisor (EA) is provided solely to sync your own
        trading data. Using it to transmit data for other traders' accounts is
        not permitted without explicit written authorisation.
      </LegalNote>
    </LegalSection>

    {/* Subscriptions */}
    <LegalSection id="billing" title="6. Subscriptions & Billing">
      <LegalSubSection title="6.1 Plans">
        <p className="text-sm">
          Tradecore offers a free plan and paid subscription tiers (Starter,
          Pro, Elite). The features available on each plan are described on our{" "}
          <a href="/#pricing" className="text-primary underline underline-offset-2">
            Pricing page
          </a>
          , which may be updated from time to time.
        </p>
      </LegalSubSection>

      <LegalSubSection title="6.2 Free Plan">
        <p className="text-sm">
          The free plan is provided as-is with no payment obligation. We reserve
          the right to modify free plan limits at any time with at least 14 days'
          notice to existing free users.
        </p>
      </LegalSubSection>

      <LegalSubSection title="6.3 Paid Subscriptions">
        <LegalList
          items={[
            "Subscriptions are billed in advance on a monthly or annual basis",
            "All fees are in US Dollars (USD) and exclusive of any applicable taxes",
            "Annual plans are billed as a single upfront payment",
            "If payment fails, access to paid features will be suspended after a grace period",
            "Prices may change with at least 30 days' notice; changes do not apply to current billing periods",
          ]}
        />
      </LegalSubSection>

      <LegalSubSection title="6.4 Cancellation & Refunds">
        <p className="text-sm">
          You may cancel your subscription at any time from the Settings page.
          Cancellation takes effect at the end of the current billing period —
          you retain full access until then. We do not offer prorated refunds for
          partial billing periods. If you believe you were charged in error,
          contact{" "}
          <a
            href="mailto:billing@tradecore.app"
            className="text-primary underline underline-offset-2"
          >
            billing@tradecore.app
          </a>{" "}
          within 14 days of the charge.
        </p>
      </LegalSubSection>
    </LegalSection>

    {/* User content */}
    <LegalSection id="user-content" title="7. Your Data & Content">
      <p className="text-sm">
        You retain full ownership of all trading data, notes, and content you
        enter into Tradecore. By using the platform, you grant Tradecore a
        limited, non-exclusive, royalty-free licence to store, process, and
        display your data solely to provide the service to you.
      </p>
      <p className="text-sm">
        We may use aggregated, anonymised data (with no personally identifiable
        information) to improve the platform, generate industry benchmarks, or
        publish market insights. Your individual trading data will never be
        shared in identifiable form.
      </p>
    </LegalSection>

    {/* IP */}
    <LegalSection id="intellectual-property" title="8. Intellectual Property">
      <p className="text-sm">
        All platform software, design, trademarks, trade names, logos, and
        content created by Tradecore are the exclusive property of Tradecore and
        are protected by applicable intellectual property laws. Nothing in these
        Terms grants you any right to use Tradecore's brand assets without prior
        written permission.
      </p>
    </LegalSection>

    {/* Termination */}
    <LegalSection id="termination" title="9. Termination">
      <LegalSubSection title="9.1 By You">
        <p className="text-sm">
          You may delete your account at any time from Settings → Account.
          Deletion is permanent and irreversible — all data will be removed
          within 30 days. Export your data before deleting.
        </p>
      </LegalSubSection>

      <LegalSubSection title="9.2 By Tradecore">
        <p className="text-sm">
          We may suspend or terminate your account immediately and without notice
          if you breach these Terms, engage in fraudulent activity, or if
          continued access would expose Tradecore or other users to harm or legal
          risk. We may also terminate accounts that have been inactive for more
          than 12 months on the free plan, with at least 30 days' prior notice.
        </p>
      </LegalSubSection>
    </LegalSection>

    {/* Liability */}
    <LegalSection id="liability" title="10. Limitation of Liability">
      <LegalWarning>
        To the maximum extent permitted by applicable law, Tradecore and its
        officers, directors, employees, and affiliates will not be liable for
        any indirect, incidental, special, consequential, or punitive damages —
        including loss of profits, trading losses, loss of data, or business
        interruption — arising out of or related to your use of the platform,
        even if we have been advised of the possibility of such damages.
      </LegalWarning>
      <p className="text-sm">
        Our total liability to you for any claim arising from these Terms or
        your use of the platform shall not exceed the greater of (a) the amount
        you paid to Tradecore in the 12 months preceding the claim, or (b)
        USD $50.
      </p>
    </LegalSection>

    {/* Warranties */}
    <LegalSection id="warranties" title="11. Disclaimer of Warranties">
      <p className="text-sm">
        Tradecore is provided "as is" and "as available" without warranty of
        any kind, express or implied, including — but not limited to — warranties
        of merchantability, fitness for a particular purpose, and
        non-infringement. We do not warrant that the platform will be
        uninterrupted, error-free, or completely secure.
      </p>
    </LegalSection>

    {/* Governing law */}
    <LegalSection id="governing-law" title="12. Governing Law & Disputes">
      <p className="text-sm">
        These Terms are governed by and construed in accordance with applicable
        laws. Any dispute arising from these Terms or your use of the platform
        shall first be attempted to be resolved through good-faith negotiation.
        If unresolved, disputes shall be submitted to binding arbitration or the
        courts of competent jurisdiction.
      </p>
    </LegalSection>

    {/* Changes */}
    <LegalSection id="changes" title="13. Changes to These Terms">
      <p className="text-sm">
        We may update these Terms at any time. For material changes, we will
        provide at least 14 days' notice via email or an in-app banner. Your
        continued use of Tradecore after the effective date of changes
        constitutes acceptance of the updated Terms.
      </p>
    </LegalSection>

    {/* Contact */}
    <LegalSection id="contact" title="14. Contact">
      <p className="text-sm">
        For questions about these Terms, contact us at:
      </p>
      <div className="bg-card border border-border rounded-xl p-5 text-sm space-y-1">
        <p className="text-foreground font-medium">Tradecore</p>
        <p>
          Email:{" "}
          <a
            href="mailto:legal@tradecore.app"
            className="text-primary underline underline-offset-2"
          >
            legal@tradecore.app
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
