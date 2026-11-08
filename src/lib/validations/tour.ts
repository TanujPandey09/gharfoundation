import { z } from "zod";

/**
 * Schema for scheduling a tour (POST /api/tours)
 */
export const CreateTourSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  date: z.string().datetime("Invalid date format"),
  time: z.string().min(1, "Time is required"),
  scheduledDate: z.string().datetime("Invalid scheduled date").optional(),
});

export type CreateTourInput = z.infer<typeof CreateTourSchema>;

/**
 * Schema for updating a tour (PATCH /api/tours/[id])
 */
export const UpdateTourSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  date: z.string().datetime().optional(),
  time: z.string().optional(),
  tourCompleted: z.boolean().optional(),
  completedDate: z.string().datetime().optional(),
});

export type UpdateTourInput = z.infer<typeof UpdateTourSchema>;
