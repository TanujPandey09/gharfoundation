# Landing Pages — Section Blueprints

> Overrides on top of `MASTER.md`. Per `imagegen-frontend-web`: vary composition per section (no repeated
> left-text/right-image), one narrative spine, one palette. Per `design-taste-frontend`: no 3 equal cards, no centered-everything hero.
> Narrative spine: **"Seedha owner se"** — no broker, real homes, real people.

---

## 1. Home `/` — Tenant landing
Goal: start a search in < 5 seconds. Primary CTA: **Search**. Secondary: owner band.

| # | Section | Layout | Content |
|---|---|---|---|
| 1 | Header | Sticky, cream, e2 on scroll | Logo · Search · "List karein — free" (ghost) · Login |
| 2 | Hero | Left-aligned, 7/5 split desktop; stacked mobile. Real Dehradun street photo right, rounded-xl | Eyebrow `micro`: "UTTARAKHAND · NO BROKERAGE" · Display: "Apna kiraye ka ghar, seedha owner se." · Search card (area, type, who) with terracotta button · Under: "2,400+ verified owners" |
| 3 | Popular areas | Horizontal chip scroller | Prem Nagar, Rajpur Rd, Clement Town, Haldwani, Rudrapur… with counts |
| 4 | Naye ghar | Horizontal card scroll (ListingCard) | 8 latest, "Sab dekhein →" |
| 5 | Kaise kaam karta hai | Asymmetric: 1 large step (photo) + 2 stacked small steps | Dhoondo → Owner se baat → Visit karke shift |
| 6 | Trust strip | Full-width `--surface-2` band, 4 stats inline | Verified owners · ₹0 brokerage · Avg reply 2 hrs · Report in 1 tap |
| 7 | Real stories | 1 big quote + 2 small, photos of real tenants | Hinglish testimonials with area + rent |
| 8 | Owner band | Terracotta full-bleed, text left, phone mockup right | "Ghar khaali hai? 3 minute mein list karein — free." CTA (white button) |
| 9 | FAQ teaser | Accordion, 4 items | Brokerage? Verified ka matlab? Safe hai? Paise? |
| 10 | Footer | 4 cols desktop / accordion mobile | Areas (SEO links), Company, Help, WhatsApp support |

## 2. Owner `/how-to-list` — Owner landing
Goal: owner taps "List karein" or "WhatsApp pe bhejein". Large type (body 18px), fewer words.

| # | Section | Layout | Content |
|---|---|---|---|
| 1 | Hero | Centered-left text, big photo of a real owner at gate | "Apna ghar kiraye pe dein — bina broker, bina fees." · Two CTAs: **List karein** (primary) · **WhatsApp pe bhejein** (WhatsApp button) |
| 2 | 4 steps | Vertical numbered timeline (not cards), photos of phone screens | Photo → Rent → Location → Kaun reh sakta hai |
| 3 | Why us | 2-col: left list of benefits, right enquiry WhatsApp mock | Verified tenants, calls on WhatsApp, free verification visit |
| 4 | Services | Simple price table | Listing free · Boost ₹99 · Agreement · Police verification |
| 5 | Owner testimonial | Single large quote, video thumbnail | "Sharma ji, Rajpur Road — 6 din mein rent ho gaya" |
| 6 | Help band | `--forest-soft` band | "Phone pe madad chahiye?" Call number + timing |

## 3. Pricing `/pricing` — Services landing
Goal: show it's free; sell one-off services, not subscriptions.

| # | Section | Layout | Content |
|---|---|---|---|
| 1 | Hero | Short, left | "Listing hamesha free. Sirf zarurat ki services ke paise." |
| 2 | Free vs Services | 1 wide "Free" card + 3 service rows (list, not equal cards) | Rent agreement, Police verification, Boost, Shifting partner — price, time, what you get |
| 3 | Bundle | Highlight band (`--haldi` accent border) | Agreement + verification combo |
| 4 | FAQ | Accordion | Refunds, timelines, documents needed |
| 5 | CTA | Plain | "Shuru karein" → `/post-property` |

---

## Shared Landing Rules
- From `ui-ux-pro-max` Landing #22 (Marketplace): the search bar *is* the CTA; show popular searches under it; autocomplete with subtle animation; map view with hover pins on `/search`; "List karein" always in navbar.
- Above-the-fold on 360×740: headline + primary CTA visible without scroll.
- Hero image `priority`, ≤ 120KB AVIF; everything else lazy.
- Motion: fade-up 8px, 200ms, once; respects `prefers-reduced-motion`.
- Every section ends with at most one action. Owner CTA appears max twice per page.
- SEO: unique H1, area-wise internal links in footer, JSON-LD (`Organization`, `FAQPage`).

