import { z } from "zod"

export const accountSchema = z.object({
  name: z.string().min(2, "Account name is required"),

  type: z.enum(["NORMAL ACCOUNT", "PROP ACCOUNT", "WAR ACCOUNT"], {
    required_error: "Account type is required",
  }),

  broker: z.string().optional(),
  propFirmName: z.string().optional(),
  accountSize: z.coerce.number().optional(),

  currency: z.string().default("$"),

  startingBalance: z.coerce
    .number()
    .min(1, "Starting balance must be greater than 0"),

  // PROP ONLY FIELDS (optional unless type === prop)
  maxDrawdownPercent: z.coerce.number().optional(),
  dailyDrawdownPercent: z.coerce.number().optional(),
  profitTarget: z.coerce.number().optional(),
  maxTradesPerDay: z.coerce.number().optional(),
})
.superRefine((data, ctx) => {
  if (data.type === "PROP ACCOUNT") {
    if (!data.propFirmName || data.propFirmName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["propFirmName"],
        message: "Prop firm name is required",
      })
    }

    if (!data.accountSize || data.accountSize <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accountSize"],
        message: "Account size must be greater than 0",
      })
    }

    if (data.maxDrawdownPercent === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxDrawdownPercent"],
        message: "Max drawdown percent is required",
      })
    }

    if (data.profitTarget === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["profitTarget"],
        message: "Profit target is required",
      })
    }
  } else {
    if (!data.broker || data.broker.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["broker"],
        message: "Broker is required",
      })
    }
  }
})