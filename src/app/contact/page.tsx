"use client";

import React, { useState } from "react";
import Icon from "@/components/shared/Icon";
import { useToast } from "@/lib/context/ToastContext";

export default function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      showToast("Message sent successfully! We'll reply within 24 hours.", "success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactOptions = [
    {
      icon: "phone",
      title: "Call our support team",
      desc: "Available daily 9:00 AM - 7:00 PM.",
      value: "+91 9876 543 210",
      href: "tel:+919876543210",
    },
    {
      icon: "email",
      title: "Email support inquiries",
      desc: "For help, partnerships, or reports.",
      value: "support@gharfoundation.com",
      href: "mailto:support@gharfoundation.com",
    },
    {
      icon: "location_on",
      title: "Headquarters address",
      desc: "Visit our office (by appointment).",
      value: "Dehradun IT Park, Uttarakhand, India",
      href: "#",
    },
  ];

  return (
    <div className="bg-white text-[#222222] min-h-screen font-sans">
      <div className="hero-mesh-bg border-b border-[#EBEBEB] pt-5 pb-7 sm:pt-8 sm:pb-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/90 border border-[#FFD1D8] text-[#FF385C] text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Icon name="support_agent" size={14} />
            <span>Dehradun &amp; Uttarakhand Help Desk</span>
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight text-[#222222]">
            Get in touch
          </h1>
          <p className="mt-2 text-[#717171] max-w-2xl mx-auto text-xs sm:text-base leading-relaxed">
            Have questions about listing your property, verifying your profile, or generating digital rental agreements? We are here to help.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            {contactOptions.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="block bg-white p-6 rounded-3xl border border-[#EBEBEB] shadow-sm hover:border-[#FF385C] transition-all duration-300 group"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rausch-100 text-[#FF385C] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Icon name={item.icon} size={20} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#222222]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#717171] mt-0.5">
                      {item.desc}
                    </p>
                    <span className="inline-block mt-3 text-xs font-bold text-[#FF385C] hover:underline">
                      {item.value}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl border border-[#EBEBEB] shadow-sm">
            <h2 className="font-display text-lg font-bold text-[#222222] mb-6">
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#717171] mb-2">
                    Your name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[#FF385C] transition-colors text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#717171] mb-2">
                    Email address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[#FF385C] transition-colors text-[#222222]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#717171] mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="What is this about?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[#FF385C] transition-colors text-[#222222]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#717171] mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[#FF385C] resize-none transition-colors text-[#222222]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-cta-primary w-full py-3.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <>
                    <Icon name="send" size={16} />
                    <span>Send message</span>
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
