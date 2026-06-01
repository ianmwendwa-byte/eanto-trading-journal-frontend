/**
 * Determines which data source and display mode to use for
 * the Transactions page summary sections.
 *
 * "all" mode  → use /dashboard/overview?sections=portfolio
 *               which correctly separates personal and prop data
 * "single" mode → use /accounts/:id full account object
 *               which has performance, personalMetrics, propMetrics
 *
 * Never mix personal and prop account data together.
 */
export const getSummaryMode = (accountId, accounts) => {
  if (!accountId || accountId === "all") {
    return { mode: "all" };
  }

  const account = (accounts ?? []).find((a) => a._id === accountId);
  if (!account) return { mode: "all" };

  return {
    mode:    "single",
    account,
    isProp:  account.type === "prop",
  };
};
