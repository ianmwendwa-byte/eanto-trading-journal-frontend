import {
  LegalLayout,
  LegalSection,
  LegalSubSection,
  LegalList,
  LegalNote,
} from "@/components/landing/LegalLayout";

export const TrackingPolicy = () => (
  <LegalLayout
    title="Cookie Policy"
    lastUpdated="June 1, 2026"
    description="How and why Tradecore uses cookies and similar technologies."
  >
    {/* What are cookies */}
    <LegalSection id="what-are-cookies" title="1. What Are Cookies?">
      <p className="text-sm">
        Cookies are small text files that a website places on your device when
        you visit. They allow the site to remember information about your visit —
        such as whether you are logged in, your preferred theme, or your session
        state.
      </p>
      <p className="text-sm">
        Tradecore also uses browser <strong className="text-foreground">localStorage</strong>,
        which works similarly to cookies but is stored locally on your device and
        not sent with every HTTP request. We refer to cookies and localStorage
        collectively as "tracking technologies" in this policy.
      </p>
    </LegalSection>

    {/* How we use cookies */}
    <LegalSection id="how-we-use" title="2. How Tradecore Uses Cookies">
      <LegalNote>
        Tradecore uses the minimum number of tracking technologies necessary to
        operate the platform. We do <strong>not</strong> use advertising cookies
        or sell cookie data to third parties.
      </LegalNote>

      <LegalSubSection title="2.1 Strictly Necessary (Essential)">
        <p className="text-sm">
          These are required for the platform to function. You cannot opt out of
          them while using Tradecore.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border mt-3">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">Name / Key</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">Purpose</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                {
                  name: "Firebase Auth session",
                  type: "localStorage",
                  purpose: "Maintains your authenticated session so you stay logged in between page refreshes",
                  duration: "Until sign out",
                },
                {
                  name: "Firebase ID token",
                  type: "Memory (not persisted)",
                  purpose: "Short-lived access token used to authenticate API requests",
                  duration: "1 hour (auto-refreshed)",
                },
                {
                  name: "__session",
                  type: "Cookie (HttpOnly)",
                  purpose: "Server-side session identifier for secure API calls",
                  duration: "Session",
                },
              ].map((r) => (
                <tr key={r.name} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-foreground font-mono text-xs">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{r.type}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{r.purpose}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{r.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSubSection>

      <LegalSubSection title="2.2 Preference / Functional">
        <p className="text-sm">
          These remember your settings and personalisation choices.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border mt-3">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">Name / Key</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">Purpose</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                {
                  name: "tradecore-ui",
                  type: "localStorage",
                  purpose: "Saves your selected colour theme (light, dark, or system) so it persists between visits",
                  duration: "Persistent",
                },
                {
                  name: "dashboard-layout",
                  type: "localStorage",
                  purpose: "Saves your customised dashboard widget arrangement",
                  duration: "Persistent",
                },
                {
                  name: "sidebar-collapsed",
                  type: "localStorage",
                  purpose: "Remembers whether the sidebar is expanded or collapsed",
                  duration: "Persistent",
                },
              ].map((r) => (
                <tr key={r.name} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-foreground font-mono text-xs">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{r.type}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{r.purpose}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{r.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSubSection>

      <LegalSubSection title="2.3 Analytics">
        <p className="text-sm">
          We use anonymised, aggregated analytics to understand how the platform
          is used and to improve it. No analytics data is linked to your personal
          identity or shared with advertising networks.
        </p>
        <LegalList
          items={[
            "Page views and navigation paths (aggregated, not per-user)",
            "Feature usage rates (e.g. how many users use CSV import vs EA sync)",
            "Error rates and performance metrics",
          ]}
        />
      </LegalSubSection>

      <LegalSubSection title="2.4 What We Do Not Use">
        <LegalList
          items={[
            "Advertising or retargeting cookies",
            "Third-party tracking pixels",
            "Social media tracking scripts",
            "Fingerprinting or device-tracking techniques",
          ]}
        />
      </LegalSubSection>
    </LegalSection>

    {/* Third-party */}
    <LegalSection id="third-party" title="3. Third-Party Cookies">
      <p className="text-sm">
        Some third-party services we use may set their own cookies:
      </p>
      <div className="overflow-x-auto rounded-lg border border-border mt-3">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">Service</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">Purpose</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">Their Policy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 text-foreground font-medium">Google Firebase</td>
              <td className="px-4 py-3 text-muted-foreground">Authentication and identity management</td>
              <td className="px-4 py-3">
                <a
                  href="https://firebase.google.com/support/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs underline underline-offset-2"
                >
                  firebase.google.com/support/privacy
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </LegalSection>

    {/* How to manage */}
    <LegalSection id="manage" title="4. How to Manage Cookies">
      <LegalSubSection title="4.1 Browser Settings">
        <p className="text-sm">
          You can control and delete cookies through your browser settings. Note
          that disabling essential cookies will prevent Tradecore from
          functioning — you will not be able to stay logged in.
        </p>
        <LegalList
          items={[
            "Chrome — Settings → Privacy and security → Cookies and other site data",
            "Firefox — Settings → Privacy & Security → Cookies and Site Data",
            "Safari — Preferences → Privacy → Manage Website Data",
            "Edge — Settings → Cookies and site permissions → Cookies and site data",
          ]}
        />
      </LegalSubSection>

      <LegalSubSection title="4.2 localStorage">
        <p className="text-sm">
          To clear Tradecore's localStorage data, open your browser's Developer
          Tools (F12), go to Application → Local Storage → your Tradecore
          domain, and delete individual keys or clear all entries. This will
          reset your theme preference, dashboard layout, and sidebar state.
        </p>
      </LegalSubSection>

      <LegalSubSection title="4.3 Clearing Your Session">
        <p className="text-sm">
          Signing out of Tradecore clears your authentication session
          automatically. If you remain signed in, your session persists until
          you explicitly sign out or it expires.
        </p>
      </LegalSubSection>
    </LegalSection>

    {/* Changes */}
    <LegalSection id="changes" title="5. Changes to This Policy">
      <p className="text-sm">
        We may update this policy to reflect changes in technology, regulation,
        or platform features. Updates will be reflected by the "Last updated"
        date above. For material changes, we will notify you via email or an
        in-app notice.
      </p>
    </LegalSection>

    {/* Contact */}
    <LegalSection id="contact" title="6. Questions?">
      <p className="text-sm">
        If you have questions about our use of browser storage, contact us at:
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
      </div>
    </LegalSection>
  </LegalLayout>
);
