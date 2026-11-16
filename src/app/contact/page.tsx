"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/shared/Icon";
import { useToast } from "@/lib/context/ToastContext";

function ContactPageInner() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam === "report" || subjectParam === "suspicious") {
      setFormData((prev) => ({
        ...prev,
        subject: "Report a Fake / Suspicious Listing",
        message: prev.message || "I would like to report a suspicious listing: [Add details or URL]",
      }));
    } else if (subjectParam === "police") {
      setFormData((prev) => ({
        ...prev,
        subject: "Police Verification Dossier Help",
      }));
    } else if (subjectParam === "agreement") {
      setFormData((prev) => ({
        ...prev,
        subject: "Digital Rental Agreement Draft",
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      showToast(data.message || "Message sent successfully! We'll reply within 24 hours.", "success");
      setIsSuccess(true);
      setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    } catch (err: any) {
      showToast(err.message || "Failed to send message. Please try again or WhatsApp us.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactOptions = [
    {
      icon: "chat",
      title: "WhatsApp Helpline",
      desc: "Fastest response (Within 1-2 hours).",
      value: "+91 79060 12345",
      href: "https://wa.me/917906012345?text=Hello%20Ghar%20Foundation%20Support%2C%20I%20have%20an%20inquiry.",
      actionLabel: "Chat on WhatsApp ↗",
      highlight: true,
    },
    {
      icon: "phone",
      title: "Dehradun Help Desk",
      desc: "Available Monday–Saturday, 9:30 AM to 6:30 PM.",
      value: "+91 79060 12345",
      href: "tel:+917906012345",
      actionLabel: "Call Now",
    },
    {
      icon: "email",
      title: "Email Support & Grievances",
      desc: "Official inquiries, KYC assistance, or complaints.",
      value: "support@gharfoundation.com",
      href: "mailto:support@gharfoundation.com",
      actionLabel: "Send Email",
    },
    {
      icon: "location_on",
      title: "Operations Hub",
      desc: "Plot No. 12, IT Park, Sahastradhara Road, Dehradun, Uttarakhand 248013",
      value: "View on Google Maps ↗",
      href: "https://maps.google.com/?q=IT+Park+Sahastradhara+Road+Dehradun+Uttarakhand+248013",
      actionLabel: "Get Directions",
    },
  ];

  return (
    <div className="bg-white text-[#222222] min-h-screen font-sans">
      <div className="hero-mesh-bg border-b border-[#EBEBEB] pt-6 pb-8 sm:pt-10 sm:pb-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/90 border border-[#FFD1D8] text-[#FF385C] text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
            <Icon name="support_agent" size={15} />
            <span>Uttarakhand Help Desk &amp; Legal Support</span>
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight text-[#222222]">
            We&apos;re here to help you rent safely.
          </h1>
          <p className="mt-2 text-[#717171] max-w-2xl mx-auto text-xs sm:text-base leading-relaxed">
            Questions about listing your property, Uttarakhand Police verification dossiers, 11-month lease agreements, or reporting suspicious brokers? Connect with our local team.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-4">
            {contactOptions.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`block p-5 rounded-2xl border transition-all duration-200 group ${
                  item.highlight
                    ? "bg-[#F0FDF4] border-[#86EFAC] hover:border-[#16A34A] shadow-sm"
                    : "bg-white border-[#EBEBEB] hover:border-[#222222] shadow-sm"
                }`}
              >
                <div className="flex gap-3.5 items-start">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.highlight ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FFF0F3] text-[#FF385C]"
                  }`}>
                    <Icon name={item.icon} size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#222222] flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className="text-[11px] font-semibold text-[#FF385C] group-hover:underline">
                        {item.actionLabel}
                      </span>
                    </h3>
                    <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                    <span className="inline-block mt-2 text-xs font-bold text-[#222222]">
                      {item.value}
                    </span>
                  </div>
                </div>
              </a>
            ))}

            {/* Quick Alert Box */}
            <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#B45309]">
                <Icon name="shield" size={16} />
                <span>Zero Brokerage &amp; Anti-Fraud Guarantee</span>
              </div>
              <p className="leading-relaxed">
                Homeowners on Ghar Foundation never charge visiting fees or advance token money before physical inspection. If anyone asks for online advance, please report them below immediately.
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-9 rounded-3xl border border-[#EBEBEB] shadow-sm">
            <h2 className="font-display text-xl font-bold text-[#222222] mb-1">
              Send our local team a message
            </h2>
            <p className="text-xs text-[#717171] mb-6">
              Fill out this form and our support desk in Dehradun will get back to you within 24 hours.
            </p>

            {isSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold flex items-center gap-2">
                <Icon name="check_circle" size={18} className="text-[#059669] shrink-0" fill />
                <span>Thank you! Your inquiry has been submitted to our support team.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] transition-colors text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] transition-colors text-[#222222]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] transition-colors text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Subject / Category
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] transition-colors text-[#222222]"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Homeowner Listing Assistance">Homeowner Listing Assistance</option>
                    <option value="Police Verification Dossier Help">Police Verification Dossier Help</option>
                    <option value="Digital Rental Agreement Draft">Digital Rental Agreement Draft</option>
                    <option value="Report a Fake / Suspicious Listing">Report a Fake / Suspicious Listing</option>
                    <option value="College Student Campus Rental">College Student Campus Rental (UPES / GEU / DIT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                  Your Message *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you? If reporting a listing, please mention the locality or property title."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl p-3.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] transition-colors text-[#222222] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-cta-primary w-full py-3 text-xs sm:text-sm font-bold disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="sync" size={16} className="animate-spin text-white" />
                    <span>Submitting Message...</span>
                  </>
                ) : (
                  <>
                    <Icon name="send" size={16} className="text-white" />
                    <span>Send Message to Help Desk</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFDFD] py-12 flex items-center justify-center text-xs text-[#717171]">Loading Help Desk...</div>}>
      <ContactPageInner />
    </Suspense>
  );
}
