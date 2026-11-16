import React, { Suspense } from "react";
import SearchContent from "./SearchContent";
import Icon from "@/components/shared/Icon";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getProperties } from "@/lib/services/properties";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Verified Rentals in Uttarakhand | Ghar Foundation",
  description: "Browse verified direct-owner flats, 1 RK, room sets, student PGs, and cottages across Dehradun, Rishikesh, and Nainital with zero brokerage.",
  alternates: {
    canonical: "/search",
  },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryClient = new QueryClient();
  const params = await searchParams;

  const searchVal = Array.isArray(params.q) ? params.q[0] : params.q || "";
  const cityFilter = Array.isArray(params.city) ? params.city[0] : params.city || "";
  const typeFilter = Array.isArray(params.type) ? params.type[0] : params.type || "";
  const maxRent = params.maxRent ? Number(Array.isArray(params.maxRent) ? params.maxRent[0] : params.maxRent) : 60000;
  const gender = Array.isArray(params.gender) ? params.gender[0] : params.gender || "";
  const bedroomsRaw = Array.isArray(params.bedrooms) ? params.bedrooms[0] : params.bedrooms || "";
  const selectedBhk = bedroomsRaw
    ? bedroomsRaw.split(",").map(Number).filter((n) => !isNaN(n))
    : [];

  const queryKey = ['properties', {
    searchVal,
    cityFilter,
    typeFilter,
    maxRent,
    selectedBhk,
    bathrooms: null,
    verifiedOnly: false,
    zeroBrokerageOnly: false,
    petFriendlyOnly: false,
    bachelorFriendlyOnly: gender === "BACHELOR",
    parking: null,
    internet: null,
    furnishing: "",
    gender: gender === "BACHELOR" ? "" : gender,
    sortOrder: "relevance",
  }];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: async () => {
      const result = await getProperties({
        search: searchVal,
        city: cityFilter,
        type: typeFilter,
        maxRent: maxRent < 100000 ? maxRent : undefined,
        gender: gender || undefined,
        bedrooms: bedroomsRaw || undefined,
      });
      return JSON.parse(JSON.stringify(result));
    },
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
