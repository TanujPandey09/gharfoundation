import React, { Suspense } from "react";
import PropertyDetailsContent from "./PropertyDetailsContent";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getPropertyById } from "@/lib/services/properties";
import Icon from "@/components/shared/Icon";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    return {
      title: "Property Not Found | Ghar Foundation",
      description: "This rental listing may have expired or been rented.",
    };
  }

  const primaryImage = property.images?.[0]?.url || "/og-image.png";
  const title = `${property.title} in ${property.city} | ₹${property.rent?.toLocaleString("en-IN")}/mo`;
  const description = `${property.propertyType?.replace("_", " ")} for rent in ${property.areaName || property.city}, Uttarakhand. ₹${property.rent?.toLocaleString("en-IN")}/month. Direct from verified homeowner. Zero brokerage.`;

  return {
    title: `${title} | Ghar Foundation`,
    description,
    alternates: {
      canonical: `/property/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `/property/${id}`,
      images: [{ url: primaryImage, width: 1200, height: 630, alt: property.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage],
    },
  };
}

export default async function PropertyDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);
  const serializedProperty = property ? JSON.parse(JSON.stringify(property)) : null;

  const queryClient = new QueryClient();
  if (serializedProperty) {
    queryClient.setQueryData(['property', id], serializedProperty);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 bg-white transition-colors">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-[#EBEBEB] rounded mx-auto" />
              <div className="h-4 w-64 bg-[#EBEBEB] rounded mx-auto" />
            </div>
          </div>
        }
      >
        <PropertyDetailsContent id={id} initialProperty={serializedProperty} />
      </Suspense>
    </HydrationBoundary>
  );
}
