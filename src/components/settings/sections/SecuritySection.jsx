import { useState } from "react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import {
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useSendPasswordReset, useDeleteUserAccount } from "@/hooks/useUser";
import { useAuthStore }  from "@/store/useAuthStore";
import { formatRelativeTime } from "@/utils/format";

// Two-step delete flow:
//   "reauth"  → user re-authenticates (required by backend — token must be < 5 min old)
//   "confirm" → user types their email to confirm permanent deletion
const DELETE_STEP = { REAUTH: "reauth", CONFIRM: "confirm" };

export const SecuritySection = () => {
  const { mongoUser } = useAuthStore();
  const { mutate: sendReset, isPending: sendingReset } = useSendPasswordReset();
  const { mutate: deleteAccount, isPending: deleting } = useDeleteUserAccount();

  const [deleteDialog, setDeleteDialog]   = useState(false);
  const [deleteStep,   setDeleteStep]     = useState(DELETE_STEP.REAUTH);
  const [confirmEmail, setConfirmEmail]   = useState("");
  const [reauthPwd,    setReauthPwd]      = useState("");
  const [reauthError,  setReauthError]    = useState(null);
  const [reauthBusy,   setReauthBusy]     = useState(false);

  const email     = mongoUser?.email ?? "";
  const security  = mongoUser?.security ?? {};
  const canDelete = confirmEmail.trim().toLowerCase() === email.toLowerCase();

  const isGoogleUser = auth.currentUser?.providerData?.[0]?.providerId === "google.com";

  const lastLoginAt    = mongoUser?.lastLoginAt ?? null;
  const lastLoginIp    = security.lastLoginIp ?? null;
  const failedAttempts = security.failedLoginAttempts ?? 0;

  const openDeleteDialog = () => {
    setDeleteStep(DELETE_STEP.REAUTH);
    setConfirmEmail("");
    setReauthPwd("");
    setReauthError(null);
    setDeleteDialog(true);
  };

  const handleReauth = async () => {
    setReauthError(null);
    setReauthBusy(true);
    try {
      if (isGoogleUser) {
        await reauthenticateWithPopup(auth.currentUser, new GoogleAuthProvider());
      } else {
        const credential = EmailAuthProvider.credential(email, reauthPwd);
        await reauthenticateWithCredential(auth.currentUser, credential);
      }
      setDeleteStep(DELETE_STEP.CONFIRM);
    } catch (err) {
      const code = err?.code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setReauthError("Incorrect password.");
      } else if (code === "auth/popup-closed-by-user") {
        setReauthError(null); // user cancelled — no error
      } else {
        setReauthError("Re-authentication failed. Please try again.");
      }
    } finally {
      setReauthBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Security Settings</p>
      </div>

      <Tabs defaultValue="password">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* ── Password ─────────────────────────────── */}
        <TabsContent value="password" className="mt-4 space-y-4">
          {/* Password reset */}
          <div className="trading-card p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Change Password</p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll send a password reset email to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendReset(email)}
              disabled={sendingReset || !email}
            >
              {sendingReset ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Email"
              )}
            </Button>
          </div>

          {/* Last login info */}
          {(lastLoginAt || lastLoginIp || failedAttempts > 0) && (
            <div className="trading-card p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Login Activity
              </p>
              {lastLoginAt && (
                <p className="text-xs text-muted-foreground">
                  Last login:{" "}
                  <span className="text-foreground">
                    {formatRelativeTime(lastLoginAt)}
                  </span>
                </p>
              )}
              {lastLoginIp && (
                <p className="text-xs text-muted-foreground">
                  From:{" "}
                  <span className="font-mono text-foreground">{lastLoginIp}</span>
                </p>
              )}
              {failedAttempts > 0 && (
                <p className="text-xs flex items-center gap-1" style={{ color: "var(--loss)" }}>
                  <span className="font-mono font-bold">{failedAttempts}</span>
                  failed login attempt{failedAttempts !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Account (Danger Zone) ────────────────── */}
        <TabsContent value="account" className="mt-4 space-y-4">
          <div className="trading-card p-4 space-y-4 border-destructive/30 bg-destructive/5">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--loss)" }}>
                Delete Account
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently and immediately deletes your account and all data.
                This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={openDeleteDialog}
            >
              Delete Account
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Delete account dialog ────────────────── */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">

          {/* Step 1: Re-authenticate */}
          {deleteStep === DELETE_STEP.REAUTH && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" style={{ color: "var(--loss)" }} />
                  Confirm your identity
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      For security, you must re-authenticate before deleting your account.
                    </p>
                    {!isGoogleUser && (
                      <div className="pt-1 space-y-1.5">
                        <p className="text-xs font-medium text-foreground">Enter your password:</p>
                        <Input
                          type="password"
                          value={reauthPwd}
                          onChange={(e) => { setReauthPwd(e.target.value); setReauthError(null); }}
                          placeholder="Your current password"
                          className="bg-background border-border h-8 text-sm"
                          autoComplete="current-password"
                          onKeyDown={(e) => e.key === "Enter" && handleReauth()}
                        />
                        {reauthError && (
                          <p className="text-[11px]" style={{ color: "var(--loss)" }}>
                            {reauthError}
                          </p>
                        )}
                      </div>
                    )}
                    {isGoogleUser && reauthError && (
                      <p className="text-[11px]" style={{ color: "var(--loss)" }}>
                        {reauthError}
                      </p>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="ghost" onClick={() => setDeleteDialog(false)} disabled={reauthBusy}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReauth}
                  disabled={reauthBusy || (!isGoogleUser && !reauthPwd)}
                >
                  {reauthBusy ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Verifying...</>
                  ) : isGoogleUser ? (
                    "Verify with Google"
                  ) : (
                    "Confirm Identity"
                  )}
                </Button>
              </AlertDialogFooter>
            </>
          )}

          {/* Step 2: Confirm permanent deletion */}
          {deleteStep === DELETE_STEP.CONFIRM && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" style={{ color: "var(--loss)" }} />
                  Delete your account?
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      This will <strong className="text-foreground">permanently and immediately</strong> delete
                      your account and all associated data — trades, transactions, accounts, EA syncs,
                      and score history. <strong className="text-foreground">There is no recovery period.</strong>
                    </p>
                    <div className="pt-1">
                      <p className="text-xs font-medium text-foreground mb-1">
                        Type your email to confirm:
                      </p>
                      <Input
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        placeholder={email}
                        className="bg-background border-border h-8 text-sm"
                        autoComplete="off"
                      />
                      {confirmEmail && !canDelete && (
                        <p className="text-[11px] mt-1" style={{ color: "var(--loss)" }}>
                          Email doesn't match
                        </p>
                      )}
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setDeleteDialog(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteAccount()}
                  disabled={!canDelete || deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Permanently Delete Account"
                  )}
                </Button>
              </AlertDialogFooter>
            </>
          )}

        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
