import { z } from "zod";

export const tradeFormSchema = z.object({
  accountId:   z.string().min(1, "Account is required"),
  pair:        z.string().min(1, "Pair is required"),
  direction:   z.enum(["buy", "sell"], { required_error: "Direction is required" }),
  pnl:         z.coerce.number({ invalid_type_error: "PnL must be a number", required_error: "PnL is required" }),
  entryPrice:  z.coerce.number({ invalid_type_error: "Must be a number" }).positive("Must be > 0"),
  exitPrice:   z.coerce.number({ invalid_type_error: "Must be a number" }).positive("Must be > 0"),
  lotSize:     z.coerce.number({ invalid_type_error: "Must be a number" }).positive("Must be > 0"),
  stopLoss:    z.coerce.number().positive().optional().or(z.literal("")),
  takeProfit:  z.coerce.number().positive().optional().or(z.literal("")),
  openedAt:    z.string().min(1, "Open time is required"),
  closedAt:    z.string().min(1, "Close time is required"),
  session:     z.string().optional(),
  commission:  z.coerce.number().min(0).optional().or(z.literal("")),
  swap:        z.coerce.number().min(0).optional().or(z.literal("")),
  riskAmount:  z.coerce.number({ required_error: "Risk amount is required", invalid_type_error: "Must be a number" }).positive("Must be > 0"),
  note:        z.string().max(1000).optional(),
  tags:        z.array(z.string()).optional(),
  setupQualityRating: z.coerce.number().int().min(1).max(5).optional().or(z.literal("")),
}).refine(
  (d) => {
    if (!d.openedAt || !d.closedAt) return true;
    return new Date(d.closedAt) >= new Date(d.openedAt);
  },
  { message: "Close time must be after open time", path: ["closedAt"] }
);

const toNum = (v) =>
  v === "" || v === null || v === undefined ? null : Number(v);

export const transformTradeForm = (data) => {
  const commission = toNum(data.commission) ?? 0;
  const swap       = toNum(data.swap)       ?? 0;
  return {
    accountId:   data.accountId,
    pair:        data.pair.toUpperCase().replace(/\s+/g, ""),
    direction:   data.direction,
    entryPrice:  toNum(data.entryPrice),
    exitPrice:   toNum(data.exitPrice),
    lotSize:     toNum(data.lotSize),
    pnl:         toNum(data.pnl) ?? 0,
    openedAt:    new Date(data.openedAt).toISOString(),
    closedAt:    new Date(data.closedAt).toISOString(),
    commission,
    swap,
    ...(toNum(data.stopLoss)    != null ? { stopLoss:    toNum(data.stopLoss)    } : {}),
    ...(toNum(data.takeProfit)  != null ? { takeProfit:  toNum(data.takeProfit)  } : {}),
    ...(data.session            ? { session:       data.session            } : {}),
    riskAmount:  toNum(data.riskAmount),
    ...(data.note               ? { note:          data.note               } : {}),
    ...(data.tags?.length       ? { tags:          data.tags               } : {}),
    ...(toNum(data.setupQualityRating) != null
      ? { setupQualityRating: toNum(data.setupQualityRating) } : {}),
  };
};
