import { useState } from "react";
import {
  Key, Copy, Check, RefreshCw, Trash2, AlertTriangle, Loader2,
  MoreVertical, Lock,
} from "lucide-react";
import { toast } from "sonner";

import { Button }   from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label }    from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useGenerateEAKey, useRevokeEAKey } from "@/hooks/useEA";
import { formatDate, formatRelativeTime } from "@/utils/format";

// ── Extract API key from response ─────────────────────────────
function extractKey(response) {
  if (!response) return null;
  return response.eaApiKey ?? null;
}

// ── Copy button with 2s feedback ─────────────────────────────
const CopyButton = ({ value, label = "Copy", className = "" }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <Button variant="outline" size="sm" onClick={handle} className={`gap-1.5 ${className}`}>
      {copied
        ? <><Check className="h-3.5 w-3.5 text-[var(--profit)]" />Copied!</>
        : <><Copy className="h-3.5 w-3.5" />{label}</>
      }
    </Button>
  );
};

// ── One-time key reveal dialog ────────────────────────────────
const KeyRevealDialog = ({ apiKey, open, onClose }) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleClose = () => {
    if (!confirmed) return;
    setConfirmed(false);
    onClose();
    toast.success("API key saved. Paste it into your EA settings to connect.");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && confirmed) handleClose(); }}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            Your EA API Key
          </DialogTitle>
          <DialogDescription>
            This key is shown <span className="font-semibold text-foreground">once only</span> and
            cannot be retrieved after you close this dialog.
          </DialogDescription>
        </DialogHeader>

        {/* Warning */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/25">
          <AlertTriangle className="h-4 w-4 text-[var(--warning)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--warning)] leading-relaxed">
            Copy and store this key securely — it will never be shown again.
            If lost, you must revoke and generate a new key.
          </p>
        </div>

        {/* Key display */}
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-background border border-border font-mono text-xs break-all text-foreground leading-relaxed select-all">
            {apiKey}
          </div>
          <CopyButton value={apiKey} label="Copy Key" className="w-full justify-center" />
        </div>

        {/* Confirmation */}
        <div className="flex items-start gap-2.5 pt-1">
          <Checkbox
            id="key-dialog-confirmed"
            checked={confirmed}
            onCheckedChange={setConfirmed}
            className="mt-0.5"
          />
          <label
            htmlFor="key-dialog-confirmed"
            className="text-xs text-muted-foreground cursor-pointer leading-relaxed"
          >
            I have copied and saved my API key in a secure location
          </label>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} disabled={!confirmed} className="w-full">
            <Check className="h-4 w-4 mr-2" />
            Done — I've saved my key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── No key state ──────────────────────────────────────────────
const NoKeyState = ({ onGenerate, isGenerating }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <Key className="h-5 w-5 text-muted-foreground" />
    </div>
    <div className="space-y-1 max-w-xs">
      <p className="text-sm font-medium text-foreground">No API Key Generated</p>
      <p className="text-xs text-muted-foreground">
        Generate a key to connect your MT4/MT5 EA. The key is shown once — store it securely.
      </p>
    </div>
    <Button onClick={onGenerate} disabled={isGenerating} size="sm" className="gap-2">
      {isGenerating
        ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
        : <><Key className="h-4 w-4" />Generate API Key</>
      }
    </Button>
  </div>
);

// ── Active key state (masked) ─────────────────────────────────
const ActiveKeyState = ({ eaSync, onRevoke, onRegenerate, isRevoking, isRegenerating }) => {
  const [revokeOpen, setRevokeOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Masked key row */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
        <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span className="font-mono text-sm text-muted-foreground tracking-widest flex-1">
          ••••••••••••••••••••••••••••••••
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border w-44">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {isRegenerating ? "Generating..." : "Regenerate Key"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-[var(--loss)] focus:text-[var(--loss)]"
              onClick={() => setRevokeOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Revoke Key
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Key meta */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground px-0.5">
        {eaSync?.keyGeneratedAt && (
          <span>Generated: {formatDate(eaSync.keyGeneratedAt)}</span>
        )}
        {eaSync?.keyLastUsedAt && (
          <span>Last used: {formatRelativeTime(eaSync.keyLastUsedAt)}</span>
        )}
        {!eaSync?.keyLastUsedAt && <span className="text-[var(--warning)]">EA not yet connected</span>}
      </div>
      <p className="text-[11px] text-muted-foreground px-0.5">
        Key cannot be retrieved — use the ⋮ menu to regenerate or revoke.
      </p>

      {/* Revoke confirmation */}
      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke EA API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This immediately disconnects your EA. Sync history is preserved but no new
              trades will sync until you generate and configure a new key.
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
    </div>
  );
};

// ── sessionStorage helpers ────────────────────────────────────
const SK = (id) => `tc_ea_has_key_${id}`;
const ssRead  = (id) => sessionStorage.getItem(SK(id)) === "true";
const ssWrite = (id, v) => v
  ? sessionStorage.setItem(SK(id), "true")
  : sessionStorage.removeItem(SK(id));

const isKeyExistsError = (msg = "") =>
  /already exists|revoke.*first|duplicate.*key/i.test(msg);

const backendHasKey = (eaSync) =>
  !!(eaSync?.hasApiKey ?? eaSync?.hasKey ?? eaSync?.keyActive ?? eaSync?.keyGeneratedAt);

// ── Main EAKeyManager ─────────────────────────────────────────
export const EAKeyManager = ({ account, eaSync }) => {
  const [newKey,       setNewKey]       = useState(null);
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [sessionFlag,  setSessionFlag]  = useState(null);

  const { mutate: generateKey, isPending: isGenerating } = useGenerateEAKey(account._id);
  const { mutate: revokeKey,   isPending: isRevoking   } = useRevokeEAKey(account._id);

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
          setDialogOpen(true);
          persistKey(true);
        } else {
          toast.error("Key generated but could not be displayed. Please revoke and try again.");
        }
      },
      onError: (error) => {
        if (isKeyExistsError(error?.message)) {
          persistKey(true);
          toast.warning("An active key already exists. Use the ⋮ menu to regenerate.");
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
    <>
      {newKey ? (
        <ActiveKeyState
          eaSync={eaSync}
          onRevoke={handleRevoke}
          onRegenerate={handleGenerate}
          isRevoking={isRevoking}
          isRegenerating={isGenerating}
        />
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

      {/* One-time key reveal dialog */}
      <KeyRevealDialog
        apiKey={newKey ?? ""}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setNewKey(null);
        }}
      />
    </>
  );
};
