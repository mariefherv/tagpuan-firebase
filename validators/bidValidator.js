const { z } = require("zod");

const bidSchema = z.object({
  request_id: z.string().min(1),
  farmer_id: z.string().min(1),

  status: z.enum([
    "Won",        // Selected as the winning bid
    "Lost",       // Not selected
    "Withdrawn",  // Canceled by the bidder
    "Pending"     // Awaiting decision
  ]).default("Pending"),

created_at: z.string().datetime().optional(),
updated_at: z.string().datetime().optional()
}).refine(data => {
  // Ensure that a bid cannot be both Won and Withdrawn
  if (data.status === "Withdrawn" && data.status === "Won") {
    return false;
  }
  return true;
}, {
  message: "A bid cannot be both Won and Withdrawn.",
});

module.exports = {
  bidSchema
};
