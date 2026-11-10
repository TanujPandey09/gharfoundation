import { z } from "zod";

/**
 * Zod validation schemas for Property-related API requests.
 */

// Valid enum values matching Prisma schema
const PropertyTypeEnum = z.enum([
  "RK_1", "ROOM_SET_1", "ROOM_SET_2",
  "BHK_1", "BHK_2", "BHK_3",
  "FLAT", "INDEPENDENT_HOUSE", "VILLA",
  "PG", "SHOP", "OFFICE",
]);

const GenderPreferenceEnum = z.enum([
  "ANY", "FAMILY", "STUDENTS", "BACHELOR", "MALE", "FEMALE",
]);

const FurnishedStatusEnum = z.enum([
  "UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED",
]);

/**
 * Schema for creating a new property (POST /api/properties)
 */
export const CreatePropertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  rent: z.number().positive("Rent must be positive"),
  deposit: z.number().min(0, "Deposit cannot be negative"),
  maintenance: z.number().min(0).default(0),
  bedrooms: z.number().int().min(0).default(1),
  bathrooms: z.number().int().min(0).default(1),
  kitchen: z.number().int().min(0).default(1),
  balcony: z.number().int().min(0).default(0),
  parking: z.boolean().default(false),
  floor: z.number().int().min(0).default(0),
  area: z.number().positive("Area must be positive"),
  availableFrom: z.string().datetime().optional(),
  propertyType: PropertyTypeEnum,
  genderPreference: GenderPreferenceEnum.default("ANY"),
  waterSupply: z.string().max(100).optional(),
  electricity: z.string().max(100).optional(),
  internet: z.boolean().default(false),
  isFurnished: FurnishedStatusEnum.default("UNFURNISHED"),

  // Location
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  areaName: z.string().min(1, "Area name is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  landmark: z.string().max(200).optional(),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits").optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Related data
  amenities: z.array(z.string().min(1)).optional(), // array of amenity names
  imageUrls: z.array(z.string().min(5)).optional(),   // array of image URLs or compressed data URLs
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;

/**
 * Schema for updating an existing property (PATCH /api/properties/[id])
 * All fields optional — only send what you want to change.
 */
export const UpdatePropertySchema = CreatePropertySchema.partial();

export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;

/**
 * Schema for validating search query params (GET /api/properties)
 */
export const SearchFiltersSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  type: z.string().optional(),                    // PropertyType enum value
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  bedrooms: z.string().optional(), // allow comma separated
  bathrooms: z.coerce.number().int().min(0).optional(),
  parking: z.coerce.boolean().optional(),
  internet: z.coerce.boolean().optional(),
  furnished: z.string().optional(),               // FurnishedStatus enum
  gender: z.string().optional(),                  // GenderPreference enum
  verified: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),                  // free text search on title/description
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sort: z.enum(["rent_asc", "rent_desc", "newest", "views", "popular"]).default("newest"),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
