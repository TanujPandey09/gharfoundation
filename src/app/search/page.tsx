import React, { Suspense } from "react";
import SearchContent from "./SearchContent";
import Icon from "@/components/shared/Icon";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getProperties } from "@/lib/services/properties";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const queryClient = new QueryClient();
  const params = await searchParams;

  const initialQuery = Array.isArray(params.q) ? params.q[0] : params.q || "";
  const initialCity = Array.isArray(params.city) ? params.city[0] : params.city || "";
  const initialType = Array.isArray(params.type) ? params.type[0] : params.type || "";

  const queryKey = ['properties', {
      searchVal: initialQuery, cityFilter: initialCity, typeFilter: initialType, maxRent: 60000, selectedBhk: [2, 3], bathrooms: null,
      verifiedOnly: false, zeroBrokerageOnly: false, petFriendlyOnly: false, bachelorFriendlyOnly: false,
      parking: null, internet: null, furnishing: "", gender: "", sortOrder: "relevance"
  }];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: async () => {
      const result = await getProperties({
        search: initialQuery,
        city: initialCity,
        type: initialType,
        bedrooms: "2,3"
      });
      // Ensure we serialize properly for React Query
      return JSON.parse(JSON.stringify(result));
    }
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center space-y-4 bg-white transition-colors">
            <div className="flex items-center space-x-2 animate-pulse">
              <Icon name="tune" size={24} className="text-[#FF385C]" />
              <span className="font-sans font-bold text-lg text-[#222222]">
                Loading Ghar Search Workspace...
              </span>
            </div>
            <div className="w-full max-w-md h-2 bg-[#EBEBEB] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF385C] rounded-full" style={{ width: "60%" }} />
            </div>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </HydrationBoundary>
  );
}
