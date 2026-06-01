import { useState } from "react";
import { Key, Copy, Check, RefreshCw, Trash2, AlertTriangle, Loader2, Hash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useGenerateEAKey, useRevokeEAKey } from "@/hooks/useEA";
import { formatDate, formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

// ── Extract API key from generate-key response ────────────────
// Backend returns: { success: true, eaApiKey: "...", message: "..." }
// Axios interceptor already unwraps response.data so we receive the body directly.
function extractKey(response) {
  if (!response) return null;
  return response.eaApiKey ?? null;
}

// ── Generic copy button with 2s feedback ─────────────────────
const CopyButton = ({ value, label = "Copy", size = "sm" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button variant="outline" size={size} onClick={handleCopy} className="gap-1.5 flex-shrink-0">
      {copied
        ? <><Check className="h-3.5 w-3.5 text-[var(--profit)]" />Copied!</>
        : <><Copy className="h-3.5 w-3.5" />{label}</>
      }
    </Button>
  );
};

// ── Account ID row ────────────────────────────────────────────
const AccountIdRow = ({ accountId }) => (
  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
    <Hash className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Account ID</p>
      <p className="font-mono text-xs text-foreground truncate">{accountId}</p>
    </div>
    <CopyButton value={accountId} label="Copy ID" />
  </div>
);

// ── State 1: No key ───────────────────────────────────────────
const NoKeyState = ({ onGenerate, isGenerating }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <Key className="h-6 w-6 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">No API Key Generated</p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Generate an API key to connect your MT4/MT5 EA to this account.
        The key will only be shown once.
      </p>
    </div>
    <Button onClick={onGenerate} disabled={isGenerating} className="gap-2">
      {isGenerating
        ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
        : <><Key className="h-4 w-4" />Generate API Key</>
      }
    </Button>
  </div>
);

// ── State 2: Key just generated — show inline ─────────────────
const ShowKeyState = ({ apiKey, onConfirmed }) => {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/25">
        <AlertTriangle className="h-4 w-4 text-[var(--warning)] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-[var(--warning)]">Copy this key NOW</p>
          <p className="text-xs text-[var(--warning)]/80 mt-0.5">
            This key will never be shown again once you close this section.
          </p>
        </div>
      </div>

      {/* Key display */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Your EA API Key</Label>
        <div className="p-3 rounded-lg bg-background border border-border font-mono text-xs break-all text-foreground leading-relaxed select-all">
          {apiKey}
        </div>
        <CopyButton value={apiKey} label="Copy Key" />
      </div>

      {/* Confirmation checkbox + button */}
      <div className="pt-2 space-y-3 border-t border-border">
        <div className="flex items-start gap-2">
          <Checkbox
            id="key-confirmed"
            checked={confirmed}
            onCheckedChange={setConfirmed}
            className="mt-0.5"
          />
          <label
            htmlFor="key-confirmed"
            className="text-xs text-muted-foreground cursor-pointer leading-relaxed"
          >
            I have copied and saved my API key in a secure location
          </label>
        </div>
        <Button
          onClick={() => {
            onConfirmed();
            toast.success("API key saved. Your EA is ready to connect.");
          }}
          disabled={!confirmed}
          className="w-full gap-2"
        >
          <Check className="h-4 w-4" />
          I've copied my key
        </Button>
      </div>
    </div>
  );
};

// ── State 3: Key active (masked) ──────────────────────────────
const ActiveKeyState = ({ eaSync, onRevoke, onRegenerate, isRevoking, isRegenerating }) => {
  const [revokeOpen,     setRevokeOpen]     = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Status row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-2 h-2 rounded-full bg-[var(--profit)]" />
        <p className="text-sm font-medium text-[var(--profit)]">API Key Active</p>
        {eaSync?.keyGeneratedAt && (
          <p className="text-xs text-muted-foreground ml-auto">
            Generated: {formatDate(eaSync.keyGeneratedAt)}
          </p>
        )}
      </div>

      {/* Masked key placeholder */}
      <div className="space-y-1">
        <div className="p-3 rounded-lg bg-muted border border-border font-mono text-sm text-muted-foreground tracking-widest">
          ••••••••••••••••••••••••••••••••
        </div>
        <p className="text-[11px] text-muted-foreground">
          Key cannot be retrieved — generate a new key to replace it
        </p>
      </div>

      {eaSync?.keyLastUsedAt && (
        <p className="text-xs text-muted-foreground">
          Last used: {formatRelativeTime(eaSync.keyLastUsedAt)}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRegenerateOpen(true)}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate Key
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-[var(--loss)] border-[var(--loss)]/30 hover:bg-[var(--loss)]/10"
          onClick={() => setRevokeOpen(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Revoke Key
        </Button>
      </div>

      {/* Revoke confirmation */}
      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke EA API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately disconnect your EA from Tradecore. Your sync history
              will be preserved but no new trades will sync until you generate a new key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setRevokeOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={isRevoking}
              onClick={() => { onRevoke(); setRevokeOpen(false); }}
            >
              {isRevoking ? "Revoking..." : "Revoke Key"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate confirmation */}
      <AlertDialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Generate New API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke your current key and generate a new one. Your EA will
              disconnect until you update it with the new key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setRegenerateOpen(false)}>Cancel</Button>
            <Button
              disabled={isRegenerating}
              onClick={() => { onRegenerate(); setRegenerateOpen(false); }}
            >
              {isRegenerating ? "Generating..." : "Generate New Key"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ── sessionStorage helpers ────────────────────────────────────
// Survives component remounts within the same browser session.
// Cross-device / pre-storage keys are handled via eaSync prop + error detection.
const SK = (id) => `tc_ea_has_key_${id}`;
const ssRead  = (id) => sessionStorage.getItem(SK(id)) === "true";
const ssWrite = (id, v) => v
  ? sessionStorage.setItem(SK(id), "true")
  : sessionStorage.removeItem(SK(id));

// Detect "key already exists" error messages from the backend
const isKeyExistsError = (msg = "") =>
  /already exists|revoke.*first|duplicate.*key/i.test(msg);

// Derive hasApiKey from any field the backend might use
const backendHasKey = (eaSync) =>
  !!(eaSync?.hasApiKey ?? eaSync?.hasKey ?? eaSync?.keyActive ?? eaSync?.keyGeneratedAt);

// ── Main EAKeyManager ─────────────────────────────────────────
export const EAKeyManager = ({ account, eaSync }) => {
  const [newKey, setNewKey] = useState(null);

  // sessionFlag: explicit action taken THIS session (null = none yet, true/false = known state).
  // null means fall through to sessionStorage then eaSync prop.
  const [sessionFlag, setSessionFlag] = useState(null);

  const { mutate: generateKey, isPending: isGenerating } = useGenerateEAKey(account._id);
  const { mutate: revokeKey,   isPending: isRevoking   } = useRevokeEAKey(account._id);

  // Priority order:
  //  1. Explicit action this session (generate / revoke)
  //  2. sessionStorage — same browser, survives remounts
  //  3. eaSync prop — backend-provided, works cross-device & for pre-storage keys
  const hasKey = sessionFlag !== null
    ? sessionFlag
    : ssRead(account._id) || backendHasKey(eaSync);

  const persistKey = (value) => {
    ssWrite(account._id, value);
    setSessionFlag(value);
  };

  const handleGenerate = () => {
    generateKey(undefined, {
      onSuccess: (response) => {
        const key = extractKey(response);
        if (key) {
          setNewKey(key);
          persistKey(true);
          toast.info("Copy your API key now — it will not be shown again.");
        } else {
          toast.error("Key generated but could not be displayed. Please revoke and try again.");
        }
      },
      onError: (error) => {
        // Backend says a key already exists — surface the revoke button
        if (isKeyExistsError(error?.message)) {
          persistKey(true);
          toast.warning("An active key already exists. Revoke it first to generate a new one.");
        }
      },
    });
  };

  const handleRevoke = () => {
    revokeKey(undefined, {
      onSuccess: () => {
        setNewKey(null);
        persistKey(false);
      },
    });
  };

  return (
    <div className="trading-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">EA API Key</p>
      </div>

      {/* Account ID — always visible for copying */}
      <AccountIdRow accountId={account._id} />

      {/* Key state machine */}
      {newKey ? (
        <ShowKeyState apiKey={newKey} onConfirmed={() => setNewKey(null)} />
      ) : hasKey ? (
        <ActiveKeyState
          eaSync={eaSync}
          onRevoke={handleRevoke}
          onRegenerate={handleGenerate}
          isRevoking={isRevoking}
          isRegenerating={isGenerating}
        />
      ) : (
        <NoKeyState onGenerate={handleGenerate} isGenerating={isGenerating} />
      )}
    </div>
  );
};
