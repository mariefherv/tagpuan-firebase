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
    is_verified: z.boolean().default(false),
    agricoin: z.number().nonnegative().optional(),
    isOnline: z.boolean().optional(),
    last_login: z.union([z.string(), z.date()]).optional(),
    last_logout: z.union([z.string(), z.date()]).optional(),

    farmer_details: z.optional(farmerDetailsSchema),
    verification: z
      .object({
        status: z.enum(["Pending", "Approved", "Rejected"]).optional(),
        date_applied: z.union([z.string(), z.date()]).optional(),
        date_response: z.union([z.string(), z.date()]).optional(),
        front_id: z.string().optional(),
        back_id: z.string().optional()
      })
      .optional()
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
