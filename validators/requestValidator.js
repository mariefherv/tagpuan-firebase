const { z } = require("zod");

const requestSchema = z.object({
  contractor_id: z.string().min(1), // Firestore document ID
  commodity: z.string().min(1),     // Also a document ID

  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.enum(['KG', 'PCS', 'BOX', 'SACK']).default("PCS"),
  duration: z.enum(["Single Order", "Weekly", "Monthly"]).default("Single Order"),
  price: z.number().min(1),

  payment_terms: z.enum([
    "cod",
    "bank",
    "gcash",
    "maya"
  ]),
  dispute_resolution: z.union([z.string(), z.null()]).optional(),
  force_majeure: z.union([z.string(), z.null()]).optional(),
  address: z
    .string()
    .min(3, "Delivery address must be at least 3 characters")
    .max(100, "Delivery address is too long"),

  logistics: z.enum(["pickup", "delivery"]),

  schedule: z.string()
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: "Schedule must be a valid ISO date string"
    })
    .refine((val) => {
      return new Date(val) > new Date();
    }, {
      message: "Schedule must be a future date"}),
  canceled: z.boolean().default(false),
  confirmed: z.boolean().default(false),
  completed: z.boolean().default(false),
  status: z.enum(["Up for Bidding","Pending", "Confirmed", "Completed", "Canceled"]).default("Up for Bidding")
}).refine(data => !(data.canceled && data.status !== "Pending"), {
  message: "Canceled orders cannot have an active status.",
  path: ["status"]
})

module.exports = {
  requestSchema
};

