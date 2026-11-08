# Ghar Foundation — Design System Specification (v1.0)

This design system defines the visual language, typography scales, design tokens, responsive layouts, motion curves, and accessibility specifications for **Ghar Foundation**. It combines high-end SaaS details (similar to Linear and Stripe) with robust mobile-first considerations for Indian middle-class users.

---

## 1. Design Philosophy
- **Simplicity**: Reduce cognitive load by hiding secondary actions until focus states occur.
- **Trust**: Solid border indicators, clear verification badges, and explicit accessibility metrics (stairs/slopes/water access).
- **Speed**: Minimal weight assets, optimized font loading, and high-density, flat card layouts that render instantly on slow networks.
- **Modern SaaS & Indian Localization**: A clean layout containing easily recognizable local markers (e.g. ₹ rupee symbol, landmark guidelines).

---

## 2. Typography System

### 2.1 Font Selection
- **Primary / Body Font**: `Inter` (sans-serif)
  *   *Rationale*: Highly readable at small font sizes (11px-14px) and compressed spacing, common on mobile devices.
- **Display / Heading Font**: `JetBrains Mono` (monospace)
  *   *Rationale*: Gives a distinct, tech-forward, high-precision aesthetic. Works exceptionally well for numeric details, pricing tables, metric tags, and headers.
- **Code Font**: `JetBrains Mono` (monospace)

### 2.2 Typography Scale

| Style Name | Font Family | Weight | Size | Line Height | Letter Spacing | Tailwind Class | Usage / Context |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | JetBrains Mono | 800 (ExtraBold) | 3.5rem (56px) | 1.1 | `-0.04em` | `font-mono font-extrabold text-6xl tracking-tighter leading-none` | Hero section main slogans |
| **Display Large** | JetBrains Mono | 800 (ExtraBold) | 2.5rem (40px) | 1.15 | `-0.03em` | `font-mono font-extrabold text-4xl tracking-tight` | Landing section titles |
| **Display Medium** | JetBrains Mono | 700 (Bold) | 2.0rem (32px) | 1.2 | `-0.02em` | `font-mono font-bold text-3xl tracking-tight` | Content section headers |
| **Display Small** | JetBrains Mono | 700 (Bold) | 1.75rem (28px) | 1.25 | `-0.01em` | `font-mono font-bold text-2xl` | Moderate cards main headers |
| **H1** | JetBrains Mono | 700 (Bold) | 1.5rem (24px) | 1.3 | `0em` | `font-mono font-bold text-xl` | Standard page main titles |
| **H2** | JetBrains Mono | 600 (SemiBold) | 1.25rem (20px) | 1.35 | `0em` | `font-mono font-semibold text-lg` | Section sub-headers |
| **H3** | JetBrains Mono | 600 (SemiBold) | 1.125rem (18px) | 1.4 | `0em` | `font-mono font-semibold text-base` | Medium component headers |
| **H4** | JetBrains Mono | 600 (SemiBold) | 1.0rem (16px) | 1.4 | `0.01em` | `font-mono font-semibold text-sm` | Small component subtitles |
| **H5** | JetBrains Mono | 500 (Medium) | 0.875rem (14px) | 1.4 | `0.02em` | `font-mono font-medium text-xs` | Mini widget labels |
| **H6** | JetBrains Mono | 500 (Medium) | 0.75rem (12px) | 1.4 | `0.03em` | `font-mono font-medium text-[12px]` | Tiny tag headings |
| **Subtitle** | Inter | 500 (Medium) | 1.125rem (18px) | 1.5 | `-0.01em` | `font-sans font-medium text-lg text-slate-500` | Introductory page text |
| **Body Large** | Inter | 400 (Regular) | 1.0rem (16px) | 1.6 | `0em` | `font-sans text-base text-slate-700` | Article / property descriptions |
| **Body Medium** | Inter | 400 (Regular) | 0.875rem (14px) | 1.5 | `0em` | `font-sans text-sm text-slate-600` | Primary details lists & cards |
| **Body Small** | Inter | 400 (Regular) | 0.75rem (12px) | 1.5 | `0.01em` | `font-sans text-xs text-slate-500` | Metadata notes, specs lists |
| **Caption** | Inter | 400 (Regular) | 0.6875rem (11px) | 1.4 | `0.02em` | `font-sans text-[11px] text-slate-400` | Disclaimers, sub-time stamps |
| **Overline** | JetBrains Mono | 600 (SemiBold) | 0.6875rem (11px) | 1.2 | `0.1em` | `font-mono font-semibold text-[11px] uppercase tracking-wider` | Category labels above titles |
| **Button Text** | Inter | 600 (SemiBold) | 0.875rem (14px) | 1.0 | `0.01em` | `font-sans font-semibold text-sm` | Primary & secondary CTAs |
| **Navigation** | Inter | 500 (Medium) | 0.875rem (14px) | 1.2 | `0.01em` | `font-sans font-medium text-sm` | Header bar navigation items |
| **Label** | Inter | 600 (SemiBold) | 0.875rem (14px) | 1.2 | `0em` | `font-sans font-semibold text-sm` | Input label headers |
| **Input** | Inter | 400 (Regular) | 0.875rem (14px) | 1.2 | `0em` | `font-sans text-sm` | Form text fields text |
| **Helper Text** | Inter | 400 (Regular) | 0.75rem (12px) | 1.4 | `0.01em` | `font-sans text-xs text-slate-400` | Input dynamic explanations |
| **Error Text** | Inter | 500 (Medium) | 0.75rem (12px) | 1.2 | `0.01em` | `font-sans font-medium text-xs text-rose-600` | Field verification failures |
| **Success Text** | Inter | 500 (Medium) | 0.75rem (12px) | 1.2 | `0.01em` | `font-sans font-medium text-xs text-emerald-600` | Valid field conformations |
| **Badge Text** | JetBrains Mono | 600 (SemiBold) | 0.6875rem (11px) | 1.0 | `0.02em` | `font-mono font-semibold text-[11px]` | Verified, BHK, price tags |
| **Card Title** | JetBrains Mono | 700 (Bold) | 1.125rem (18px) | 1.3 | `-0.01em` | `font-mono font-bold text-base` | Property name on grid listings |
| **Card Subtitle**| Inter | 400 (Regular) | 0.875rem (14px) | 1.4 | `0em` | `font-sans text-sm text-slate-500` | Area & city location labels |
| **Footer Link** | Inter | 400 (Regular) | 0.8125rem (13px) | 1.5 | `0em` | `font-sans text-[13px] text-slate-400` | Footer directories, terms pages |

---

## 3. Design Tokens

### 3.1 Custom Color Palette

| Token Name | Light HEX | Dark HEX | CSS / Tailwind Configuration Name |
| :--- | :--- | :--- | :--- |
| **Text Default** | `#0A0A0A` | `#F3F4F6` | `theme-text` / `text-[#0A0A0A]` / `dark:text-gray-100` |
| **Primary** | `#1E3A8A` | `#3B82F6` | `theme-primary` / `bg-[#1E3A8A]` / `dark:bg-blue-500` |
| **Secondary** | `#2563EB` | `#60A5FA` | `theme-secondary` / `bg-[#2563EB]` / `dark:bg-blue-400` |
| **Accent** | `#16A34A` | `#4ADE80` | `theme-accent` / `text-[#16A34A]` / `dark:text-emerald-400` |
| **Background** | `#FFFFFF` | `#0B0F19` | `bg-white` / `dark:bg-[#0B0F19]` |
| **Surface** | `#F8FAFC` | `#111827` | `bg-slate-50` / `dark:bg-gray-900` |
| **Border** | `#E5E7EB` | `#374151` | `theme-border` / `border-gray-200` / `dark:border-gray-700` |
| **Muted Text** | `#64748B` | `#94A3B8` | `text-slate-500` / `dark:text-slate-400` |
| **Success** | `#16A34A` | `#4ADE80` | `text-emerald-600` / `dark:text-emerald-400` |
| **Warning** | `#F59E0B` | `#F59E0B` | `text-amber-500` / `bg-amber-500` |
| **Error** | `#EF4444` | `#EF4444` | `text-rose-500` / `bg-rose-500` |
| **Info** | `#2563EB` | `#60A5FA` | `text-blue-600` / `dark:text-blue-400` |
| **Disabled** | `#E2E8F0` | `#1F2937` | `bg-slate-200` / `dark:bg-gray-800` |
| **Overlay** | `rgba(10,10,10,0.4)` | `rgba(0,0,0,0.6)` | `bg-neutral-950/40` |

### 3.2 Spacing & Radii Scale
- **Spacing Grid**:
  *   `4px` (`space-1`), `8px` (`space-2`), `12px` (`space-3`), `16px` (`space-4`), `24px` (`space-6`), `32px` (`space-8`), `48px` (`space-12`), `64px` (`space-16`).
- **Border Radii**:
  *   Small Tags / Icons: `rounded-md` (`6px`)
  *   Form Fields & Inputs: `rounded-lg` (`8px`)
  *   Primary CTAs & Action Items: `rounded-xl` (`12px`)
  *   Property & Metric Cards: `rounded-2xl` (`16px`)
  *   Avatar Circles: `rounded-full` (`999px`)
- **Shadows**:
  *   Standard Card: `shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]`
  *   Premium Elevated Cards (v2.0): `shadow-premium` (`0 12px 30px -4px rgba(30, 58, 138, 0.08)`)
  *   Overlay Modals: `shadow-[0_20px_50px_-12px_rgba(10,10,10,0.25)]`

---

## 4. Component Layout Specifications

### 4.1 Buttons
*   **Primary CTA**: Background `#1E3A8A` (Primary), Text White, Rounded 12px, hover background `#2563EB` (Secondary), click-scale animation.
    *   *Tailwind*: `bg-[#1E3A8A] text-white rounded-xl py-3 px-6 text-sm font-semibold hover:bg-[#2563EB] transition-all duration-200 active:scale-[0.98]`
*   **Secondary Option**: Outline Border `#E5E7EB`, Text `#0A0A0A`, Rounded 12px, hover surface background `#F8FAFC`.
    *   *Tailwind*: `border border-gray-200 text-neutral-950 rounded-xl py-3 px-6 text-sm font-semibold hover:bg-slate-50 transition-all duration-200`
*   **Accent CTA (WhatsApp & Verification)**: Background `#16A34A` (Accent), Text White, Rounded 12px.
    *   *Tailwind*: `bg-[#16A34A] text-white rounded-xl py-3 px-6 text-sm font-semibold hover:bg-green-700 transition-all duration-200 active:scale-[0.98]`

### 4.2 Form Inputs
*   Container for text, border highlight on focus, custom error label.
    *   *Tailwind*: `w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all`

### 4.3 Property Listing Cards
*   High-density visual layout. Top section contains image with swipe dots and verification tag (`#16A34A`). Bottom contains pricing (`JetBrains Mono`), beds counts, and quick contact action buttons.
    *   *Tailwind*: `relative flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300`

---

## 5. Motion Curves & Animations

All transitions are powered by CSS or Framer Motion using a single standard bezier curve to achieve a unified, snappy responsive feel.

### 5.1 Standard Transition Curves
- **Standard Curve**: `ease-in-out` / cubic-bezier (`0.16, 1, 0.3, 1`)
- **Fast Speed**: `150ms` (for button hovers, dropdown shifts)
- **Standard Speed**: `300ms` (for modal overlays, search transitions)
- **Delayed Speed**: `600ms` (for page layout transitions)

### 5.2 Micro-Interactions Snippet (Tailwind/CSS)
- **Interactive Card Lift**:
  `hover:-translate-y-1.5 hover:shadow-premium duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`
- **Button Press Compression**:
  `active:scale-[0.97] transition-transform duration-100`
- **Skeleton Shimmer**:
  `animate-pulse bg-gradient-to-r from-slate-200 to-slate-100 dark:from-gray-800 dark:to-gray-700`

---

## 6. Accessibility & Contrast (WCAG AA Compliance)

### 6.1 Touch Targets
- All primary triggers, links, and map interactive anchors must cover a minimum surface area of **48 x 48px** to guarantee accessibility for aged/rural user demographics on small mobile screens.

### 6.2 Color Contrast Matrix
- **Text over Accent Background (`#16A34A`)**: Ensure light text is used only when contrasting values exceed 4.5:1 ratio.
- **Focus Rings**: All keyboard-focused inputs must show an outline offset:
  *   *Tailwind*: `focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2`
- **Reduced Motion Support**: Apply transitions conditional on hardware performance profiles:
  *   *CSS*: `@media (prefers-reduced-motion: reduce)` disable animations.

---

## 7. Tailwind Configuration Code Integration

Add this file payload directly to your workspace `tailwind.config.ts` to implement these design system tokens:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-jetbrains)", "monospace"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        brandText: {
          light: "#0A0A0A",
          dark: "#F3F4F6",
        },
        brandPrimary: {
          DEFAULT: "#1E3A8A",
          dark: "#3B82F6",
        },
        brandSecondary: {
          DEFAULT: "#2563EB",
          dark: "#60A5FA",
        },
        brandAccent: {
          DEFAULT: "#16A34A",
          dark: "#4ADE80",
        },
        brandBorder: {
          light: "#E5E7EB",
          dark: "#374151",
        },
        brandSurface: {
          light: "#F8FAFC",
          dark: "#111827",
        },
      },
      boxShadow: {
        premium: "0 12px 30px -4px rgba(30, 58, 138, 0.08)",
        premiumDark: "0 12px 30px -4px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
```
