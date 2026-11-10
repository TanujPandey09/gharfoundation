import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gharfoundation.vercel.app";

  // Core Static Pages
  const staticRoutes = [
    "",
    "/search",
    "/post-property",
    "/pricing",
    "/faq",
    "/about",
    "/contact",
    "/safety-tips",
    "/how-to-list",
    "/terms",
    "/privacy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Programmatic Uttarakhand SEO Locality & Category landing routes
  const programmaticRoutes = [
    "/search?city=Dehradun",
    "/search?city=Rishikesh",
    "/search?city=Haridwar",
    "/search?city=Haldwani",
    "/search?city=Nainital",
    "/search?city=Mussoorie",
    "/search?city=Roorkee",
    "/search?city=Almora",
    "/search?type=ROOM_SET_1",
    "/search?type=BHK_1",
    "/search?type=BHK_2",
    "/search?type=PG",
    "/search?gender=FAMILY",
  ].map((queryPath) => ({
    url: `${baseUrl}${queryPath}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // Dynamic Property Pages — fetch real data from database
  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const properties = await prisma.property.findMany({
      select: { id: true, updatedAt: true },
      take: 1000,
    });

    propertyRoutes = properties.map((prop) => ({
      url: `${baseUrl}/property/${prop.id}`,
      lastModified: prop.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    // Graceful fallback if database is connecting
  }

  return [...staticRoutes, ...programmaticRoutes, ...propertyRoutes];
}
