import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const joinWaitlist = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const name = args.name.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: "Please enter a valid email address." };
    }

    // Validate name
    if (!name || name.length < 2) {
      return { success: false, message: "Please enter your name." };
    }

    // Check for duplicate email
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      return { success: false, duplicate: true, message: "Already registered" };
    }

    // Insert new entry
    await ctx.db.insert("waitlist", {
      name,
      email,
      source: args.source || "direct",
      joinedAt: Date.now(),
    });

    return { success: true, message: "You are on the list ✓" };
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("waitlist").collect();
    return all.length;
  },
});
