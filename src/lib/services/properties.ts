import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getProperties(filters: any) {
  const where: Prisma.PropertyWhereInput = {};

  if (filters.city) where.city = { equals: filters.city, mode: "insensitive" };
  if (filters.district) where.district = { equals: filters.district, mode: "insensitive" };
  if (filters.type) where.propertyType = filters.type as any;
  if (filters.furnished) where.isFurnished = filters.furnished;
  if (filters.gender) where.genderPreference = filters.gender as any;
  if (filters.verified !== undefined) where.isVerified = filters.verified === "true" || filters.verified === true;
  if (filters.featured !== undefined) where.isFeatured = filters.featured === "true" || filters.featured === true;

  // Rent range filter
  if (filters.minRent || filters.maxRent) {
    where.rent = {};
    if (filters.minRent) where.rent.gte = Number(filters.minRent);
    if (filters.maxRent) where.rent.lte = Number(filters.maxRent);
  }

  // Bathrooms, parking, internet filters
  if (filters.bathrooms !== undefined) where.bathrooms = { gte: Number(filters.bathrooms) };
  if (filters.parking !== undefined) where.parking = filters.parking === "true" || filters.parking === true;
  if (filters.internet !== undefined) where.internet = filters.internet === "true" || filters.internet === true;

  // Bedrooms filter
  if (filters.bedrooms) {
    const bhkArr = typeof filters.bedrooms === "string" 
      ? filters.bedrooms.split(",").map(Number).filter((n: number) => !isNaN(n))
      : Array.isArray(filters.bedrooms) ? filters.bedrooms : [];
    if (bhkArr.length > 0) {
      where.bedrooms = { in: bhkArr };
    }
  }

  // Free text search on title and description
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { areaName: { contains: filters.search, mode: "insensitive" } },
      { city: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Sorting
  let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: "desc" };
  switch (filters.sort) {
    case "price-low": orderBy = { rent: "asc" }; break;
    case "price-high": orderBy = { rent: "desc" }; break;
    case "newest": orderBy = { createdAt: "desc" }; break;
    case "views": 
    case "popular": orderBy = { viewsCount: "desc" }; break;
  }

  // Pagination
  const page = filters.page ? Number(filters.page) : 1;
  const limit = filters.limit ? Number(filters.limit) : 20;
  const skip = (page - 1) * limit;
  const take = limit;

  // Execute query with count
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        images: true,
        amenities: true,
        owner: {
          select: { id: true, name: true, image: true, role: true, phone: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPropertyById(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      amenities: true,
      owner: {
        select: { id: true, name: true, image: true, role: true, phone: true, email: true },
      },
      reviews: {
        include: {
          user: { select: { id: true, name: true, image: true } }
        },
        orderBy: { createdAt: "desc" },
      }
    },
  });
  
  if (property) {
    // Increment view count asynchronously
    prisma.property.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    }).catch(console.error);
  }
  
  return property;
}
