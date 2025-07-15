const { z } = require("zod");

const farmerDetailsSchema = z.object({
  commodity: z.array(z.string()).optional(),
  paymentTerms: z.array(z.enum([
    "cod",
    "gcash",
    "maya",
    "bank"
  ])).optional(),
  modeOfDelivery: z.array(z.enum(["pickup", "delivery"])).optional()
});

const userSchema = z
  .object({
    uid: z.string().min(1),
    username: z.string().min(1),
    email: z.string().email(),
    role: z.enum(["Contractor", "Farmer", "Vendor", "Admin"]),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    middle_name: z.union([z.string(), z.null()]).optional(),
    suffix: z.string().optional(),
    frontIDUrl: z.string().url(),
    backIDUrl: z.string().url(),
    profile_picture: z.string().default("https://firebasestorage.googleapis.com/v0/b/notional-buffer-462011-q7.firebasestorage.app/o/users%2Fdefault%2Ftagpuan-default.jpg?alt=media&token=abf57682-d90c-4665-bbc8-a9905288fec6"),
    agricoin: z.number().nonnegative().optional().default(0),
    isOnline: z.boolean().optional().default(false),
    verification: z.enum(["Pending", "Approved", "Rejected"]).default("Pending"),
    farmer_details: z.optional(farmerDetailsSchema),
    lastSeen: z.any().optional()
   })
  .refine(
    data => {
      if (data.role === "Farmer") return !!data.farmer_details;
      return true;
    },
    {
      message: "farmer_details is required when role is Farmer",
      path: ["farmer_details"]
    }
  );

module.exports = {
  userSchema
};
