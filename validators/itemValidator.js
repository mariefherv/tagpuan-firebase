const { z } = require("zod");import { Timestamp } from "firebase/firestore";

export const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),

  seller_id: z.string().min(1, "Seller ID is required"), // Firestore stores references as string paths or IDs

  marketplace: z.enum(["Farmers", "Consumers"], {
    required_error: "Marketplace is required",
  }),

  description: z.string().optional(),

  price: z.number().min(0, "Price must be a positive number").default(1),

  agricoin: z.number().min(0, "Agricoin value must be a positive number").default(1),
});

export const orderSchema = z.object({
  item_id: z.string().min(1, "Item ID is required"), // Firestore document ID
  buyer_id: z.string().min(1, "Buyer ID is required"), // Firestore document ID
  quantity: z.number().min(1, "Quantity must be at least 1"),
  total_price: z.number().min(0, "Total price must be a positive number"),
  status: z.enum(["Pending", "Confirmed", "Completed", "Canceled"]).default("Pending"),
  order_date: z.date().default(() => new Date()), // Defaults to current date
  delivery_date: z.date().optional(), // Optional delivery date
  payment_method: z.enum(["cod", "bank", "gcash", "maya"]).default("cod"),
  delivery_address: z.string().min(10, "Delivery address must be at least 10 characters").max(100, "Delivery address is too long").optional(),
});

module.exports = { itemSchema };

