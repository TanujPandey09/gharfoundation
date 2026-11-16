import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/lib/context/QueryProvider";
import LayoutWrapper from "@/components/shared/LayoutWrapper";
import CookieConsent from "@/components/shared/CookieConsent";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gharfoundation.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Ghar Foundation | Zero Brokerage Rental Homes & Room Sets in Uttarakhand",
    template: "%s | Ghar Foundation",
  },
  description: "Direct owner rental property platform for Uttarakhand. Find verified 1 RK, Room Sets, 1/2/3 BHK Flats, Cottages, and PGs in Dehradun, Haridwar, Rishikesh, Haldwani, Mussoorie with 100% direct contact and zero broker fees.",
  keywords: [
    "Uttarakhand Rentals",
    "Flats for Rent Dehradun",
    "Room Set in Dehradun",
    "1 BHK Dehradun Rajpur Road",
    "Rishikesh Tapovan PG",
    "Haldwani Room Rent",
    "Mussoorie Cottages",
    "Haridwar Rentals",
    "Zero Brokerage Uttarakhand",
    "Direct Owner Rent Uttarakhand",
    "Student PG Roorkee",
    "Family Rental Homes Uttarakhand"
  ],
  authors: [{ name: "Ghar Foundation Team", url: APP_URL }],
  creator: "Ghar Foundation",
  publisher: "Ghar Foundation",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    title: "Ghar Foundation | Zero Brokerage Rentals in Uttarakhand",
    description: "Connect directly with verified owners for room sets, flats, cottages, and commercial spaces across Uttarakhand's 13 districts with zero brokerage fees.",
    siteName: "Ghar Foundation",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ghar Foundation — Verified Rentals in Uttarakhand",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghar Foundation | Verified Rentals in Uttarakhand",
    description: "Zero brokerage, direct owner connection, and verified room sets across Uttarakhand.",
    images: ["/og-image.png"],
  },
  other: {
    "geo.region": "IN-UT",
    "geo.placename": "Uttarakhand, India",
    "geo.position": "30.3165;78.0322",
    "ICBM": "30.3165, 78.0322",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["Organization", "RealEstateListingService"],
                  "@id": `${APP_URL}/#organization`,
                  "name": "Ghar Foundation",
                  "url": APP_URL,
                  "logo": `${APP_URL}/icons/icon-192x192.png`,
                  "description": "Uttarakhand's direct rental property platform connecting renters with verified property owners across all 13 districts with zero brokerage fees.",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Plot No. 12, IT Park, Sahastradhara Road",
                    "addressLocality": "Dehradun",
                    "postalCode": "248013",
                    "addressRegion": "Uttarakhand",
                    "addressCountry": "IN"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 30.3165,
                    "longitude": 78.0322
                  },
                  "areaServed": [
                    "Dehradun",
                    "Rishikesh",
                    "Haridwar",
                    "Haldwani",
                    "Nainital",
                    "Mussoorie",
                    "Roorkee",
                    "Almora",
                    "Tehri Garhwal",
                    "Pauri Garhwal",
                    "Uttarkashi",
                    "Chamoli",
                    "Pithoragarh"
                  ],
                  "priceRange": "₹4,500 - ₹40,000"
                },
                {
                  "@type": "WebSite",
                  "@id": `${APP_URL}/#website`,
                  "url": APP_URL,
                  "name": "Ghar Foundation",
                  "publisher": { "@id": `${APP_URL}/#organization` },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": `${APP_URL}/search?q={search_term_string}`
                    },
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-white text-textPrimary" suppressHydrationWarning>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          proxyUrl={process.env.NEXT_PUBLIC_CLERK_PROXY_URL || undefined}
        >
          <QueryProvider>
            <AuthProvider>
              <ThemeProvider>
                <ToastProvider>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                  <CookieConsent />
                </ToastProvider>
              </ThemeProvider>
            </AuthProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
