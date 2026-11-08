"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const WhatsAppIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const Footer: React.FC<{ forceShow?: boolean }> = ({ forceShow }) => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (!forceShow && (pathname === "/login" || pathname === "/signup" || pathname === "/onboarding")) return null;

  return (
    <footer className="bg-mitti-950 text-mitti-100 border-t border-mitti-900 transition-colors">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 lg:px-10 py-14 md:py-18">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-baseline gap-2 mb-3">
              <span className="font-display font-extrabold text-2xl text-cream">
                Ghar<span className="text-terracotta-500">.</span>
              </span>
              <span className="text-xs text-mitti-400">Foundation</span>
            </Link>
            <p className="text-mitti-400 text-sm leading-relaxed max-w-sm mb-5">
              Rental rooms, flats, and houses across Uttarakhand — directly from verified owners. Zero broker commission, direct contact for families, couples, and professionals.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/919999999999?text=Hello,%20I%20have%20an%20inquiry%20about%20Ghar%20Foundation."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-whatsapp hover:brightness-110 text-white text-xs font-semibold px-3.5 py-2 rounded-btn transition-transform active:scale-95"
              >
                <WhatsAppIcon size={16} />
                WhatsApp Support
              </a>
              <span className="text-xs text-mitti-500">Dehradun · Haldwani · Rishikesh</span>
            </div>
          </div>

          {/* Local Cities */}
          <div>
            <h3 className="font-sans font-bold text-cream mb-3.5 text-xs uppercase tracking-wider">
              Top Localities
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Prem Nagar, Dehradun", href: "/search?city=Dehradun&q=Prem+Nagar" },
                { label: "Rajpur Road, Doon", href: "/search?city=Dehradun&q=Rajpur+Road" },
                { label: "Clement Town, Doon", href: "/search?city=Dehradun&q=Clement+Town" },
                { label: "Haldwani, Nainital", href: "/search?city=Haldwani" },
                { label: "Rishikesh Tapovan", href: "/search?city=Rishikesh" },
                { label: "Haridwar & Roorkee", href: "/search?city=Haridwar" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-mitti-400 hover:text-cream transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tenants & Owners */}
          <div>
            <h3 className="font-sans font-bold text-cream mb-3.5 text-xs uppercase tracking-wider">
              Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Free Property Listing", href: "/post-property" },
                { label: "Families & Couples", href: "/search?gender=FAMILY" },
                { label: "Pricing & Boosts", href: "/pricing" },
                { label: "Police Verification Guide", href: "/safety-tips" },
                { label: "Rent Agreement Templates", href: "/faq" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-mitti-400 hover:text-cream transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h3 className="font-sans font-bold text-cream mb-3.5 text-xs uppercase tracking-wider">
              Trust &amp; Safety
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Safety Tips", href: "/safety-tips" },
                { label: "About Ghar", href: "/about" },
                { label: "Frequently Asked Questions", href: "/faq" },
                { label: "Contact Us", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-mitti-400 hover:text-cream transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-mitti-900 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-mitti-500">
          <p>© {currentYear} Ghar Foundation. Uttarakhand's Direct Rental Network.</p>
          <p className="flex items-center gap-1 text-mitti-400">
            <span>Zero Brokerage · 100% Direct Owner Contact</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
