import { z } from "zod";

/**
 * Schema for submitting a review (POST /api/properties/[id]/reviews)
 */
export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  comment: z.string().min(5, "Comment must be at least 5 characters").max(2000),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

/**
 * Schema for reporting a property (POST /api/properties/[id]/report)
 */
export const CreateReportSchema = z.object({
  reason: z.string().min(10, "Please provide a detailed reason (at least 10 characters)").max(1000),
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;
