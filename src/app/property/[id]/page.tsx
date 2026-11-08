import React, { Suspense } from "react";
import PropertyDetailsContent from "./PropertyDetailsContent";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getPropertyById } from "@/lib/services/properties";
import Icon from "@/components/shared/Icon";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const result = await getPropertyById(id);
      return JSON.parse(JSON.stringify(result));
    }
  });

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
        <PropertyDetailsContent id={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
