import { z } from "zod"

export const accountSchema = z.object({
  name: z.string().min(2, "Account name is required"),

  type: z.enum(["normal", "prop", "war"], {
    required_error: "Account type is required",
  }),

  broker: z.string().min(2, "Broker is required"),

  currency: z.string().default("USD"),

  startingBalance: z.coerce
    .number()
    .min(1, "Starting balance must be greater than 0"),

  // PROP ONLY FIELDS (optional unless type === prop)
  maxDrawdownPercent: z.coerce.number().optional(),
  profitTarget: z.coerce.number().optional(),
})
.refine((data) => {
  // enforce prop rules
  if (data.type === "prop") {
    return (
      data.maxDrawdownPercent !== undefined &&
      data.profitTarget !== undefined
    )
  }
  return true
}, {
  message: "Prop accounts require max drawdown and profit target",
  path: ["maxDrawdownPercent"],
})