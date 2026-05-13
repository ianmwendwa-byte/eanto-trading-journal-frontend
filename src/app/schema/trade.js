import { z } from "zod"

export const tradeSchema = z.object({
  accountId: z.string().min(1, "Account is required"),

  pair: z
    .string()
    .min(3, "Pair is required")
    .transform((val) => val.toUpperCase()),

  direction: z.enum(["buy", "sell"], {
    required_error: "Direction is required",
  }),

  lotSize: z.coerce
    .number({ invalid_type_error: "Lot size is required" })
    .positive("Lot size must be positive"),

  entryPrice: z.coerce
    .number({ invalid_type_error: "Entry price is required" })
    .positive("Entry price must be positive"),

  stopLoss: z.coerce
    .number({ invalid_type_error: "Stop loss is required" })
    .positive("Stop loss must be positive"),

  takeProfit: z.coerce
    .number()
    .positive("Take profit must be positive")
    .optional()
    .or(z.literal("")),

  pnl: z.coerce.number({ invalid_type_error: "P&L is required" }),

  riskAmount: z.coerce
    .number({ invalid_type_error: "Risk amount is required" })
    .positive("Risk amount must be positive"),

  session: z.enum(["london", "new_york", "asia", "sydney", "tokyo"], {
    required_error: "Session is required",
  }),

  note: z.string().optional(),
})