import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState }  from "@/components/shared/ErrorState";
import { AccountCard, AccountCardSkeleton } from "@/components/accounts/AccountCard";
import { AccountsToolbar } from "@/components/accounts/AccountsToolbar";
import { AddAccountSheet } from "@/components/accounts/AddAccountSheet";
import { Pagination }      from "@/components/shared/Pagination";
import { useAccounts, useDeleteAccount } from "@/hooks/useAccounts";
import { pageVariants, staggerContainerVariants } from "@/lib/animations";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PAGE_SIZE = 3;

export const Accounts = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── URL-synced filter state ───────────────────────────────
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const search   = searchParams.get("q")    ?? "";
  const type     = searchParams.get("type") ?? "";
  const sort     = searchParams.get("sort") ?? "createdAt_desc";
  const viewMode = searchParams.get("view") ?? "grid";

  const [sheetOpen,    setSheetOpen]    = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmName,  setConfirmName]  = useState("");

  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(updates)) {
        if (v === "" || v == null) next.delete(k);
        else next.set(k, String(v));
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // ── Data ─────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useAccounts({ page, limit: PAGE_SIZE, q: search || undefined, type: type || undefined, sort });

  const accounts   = data?.accounts   ?? [];
  const pagination = data?.pagination ?? {};

  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  // ── Handlers ─────────────────────────────────────────────
  const handleDelete = () => {
    if (confirmName !== deleteTarget?.name) {
      toast.error("Account name does not match. Please try again.");
      return;
    }
    deleteAccount(deleteTarget._id, {
      onSuccess: () => { setDeleteTarget(null); setConfirmName(""); },
    });
  };

  const isFiltered = !!(search || type);

  // ── Render ────────────────────────────────────────────────
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 space-y-5"
    >
      {/* ── Page header ─────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your trading accounts
          </p>
        </div>
        <Button onClick={() => setSheetOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* ── Toolbar ─────────────────────────────── */}
      <AccountsToolbar
        search={search}
        onSearch={(q) => updateParams({ q, page: 1 })}
        type={type}
        onTypeChange={(t) => updateParams({ type: t, page: 1 })}
        sort={sort}
        onSortChange={(s) => updateParams({ sort: s, page: 1 })}
        viewMode={viewMode}
        onViewModeChange={(v) => updateParams({ view: v })}
        totalCount={isLoading ? undefined : pagination.total}
      />

      {/* ── Content ─────────────────────────────── */}
      {isLoading ? (
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            : "flex flex-col gap-3"
        }>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <AccountCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          message="Failed to load your accounts"
          onRetry={refetch}
          className="min-h-[40vh]"
        />
      ) : !accounts.length ? (
        <div className="flex items-center justify-center min-h-[45vh]">
          {isFiltered ? (
            <EmptyState
              icon={Wallet}
              title="No accounts match your filters"
              description="Try adjusting your search or filters to find what you're looking for."
              action={
                <Button
                  variant="outline"
                  onClick={() => updateParams({ q: "", type: "", page: 1 })}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Wallet}
              title="No accounts yet"
              description="Add your first trading account to start tracking your performance across all your accounts."
              action={
                <Button onClick={() => setSheetOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <>
          <motion.div
            key={`${page}-${type}-${sort}-${search}`}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                : "flex flex-col gap-3"
            }
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
          >
            {accounts.map((account) => (
              <AccountCard
                key={account._id}
                account={account}
                viewMode={viewMode}
                onEdit={() => {}}
                onDelete={(acc) => { setDeleteTarget(acc); setConfirmName(""); }}
              />
            ))}
          </motion.div>

          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => updateParams({ page: p })}
            isFetching={isFetching}
          />
        </>
      )}

      {/* ── Add account sheet ────────────────────── */}
      <AddAccountSheet open={sheetOpen} onOpenChange={setSheetOpen} />

      {/* ── Delete confirmation dialog ───────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setConfirmName(""); } }}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                This will permanently delete{" "}
                <span className="font-semibold text-foreground">{deleteTarget?.name}</span>{" "}
                and all its trades, transactions, and history. This cannot be undone.
              </span>
              <span className="block text-xs text-muted-foreground">
                Type the account name to confirm:
              </span>
              <input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={deleteTarget?.name}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteTarget(null); setConfirmName(""); }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || confirmName !== deleteTarget?.name}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
