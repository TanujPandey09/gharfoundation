# User Flows — How Users Interact with Ghar Foundation

> Companion to `MASTER.md`. Every screen below uses MASTER tokens/components. Rules: browsing is login-free,
> one auth screen max (phone OTP), one terracotta CTA per region, Hinglish copy.

## 0. Personas
| Persona | Goal | Device | Biggest fear |
|---|---|---|---|
| **Tenant – Rohit (28, transferee)** | Find 1BHK in 1 week, no broker | Android, 4G | Fake listings, broker fees |
| **Tenant – Family (Meena, 38)** | Safe 2BHK near school | Shared phone | Safety, hidden charges |
| **Owner – Sharma ji (58)** | Rent out floor quickly to a decent family | Android, WhatsApp-heavy | Tech complexity, bad tenants |

## 1. Entry Points
```mermaid
flowchart LR
  G[Google search: room in Dehradun] --> SR[Search results page /search]
  W[WhatsApp shared listing] --> PD[Property detail /property/id]
  D[Direct / word of mouth] --> H[Home /]
  O[Owner ad: List free] --> LP[Owner landing /how-to-list]
  H --> SR
  H --> LP
```

## 2. Tenant — Discover to Move-in
```mermaid
flowchart TD
  A[Home] --> B[Search: area + type + who]
  B --> C[Results: list / map]
  C --> F{Filter sheet}
  F --> C
  C --> D[Property detail]
  D --> S[Save / Set alert]
  S -->|needs login| OTP
  D --> CT[Tap Call or WhatsApp]
  CT --> L{Logged in?}
  L -- No --> OTP[Phone OTP bottom sheet]
  OTP --> CON[Contact owner revealed]
  L -- Yes --> CON
  CON --> V[Schedule visit optional]
  V --> P{24h later: Mila ghar?}
  P -- Haan --> M[Offer: Rent agreement + Police verification]
  P -- Nahi --> C
  M --> DONE[Move-in checklist]
```
**Interaction details**
| Step | Interaction | Feedback |
|---|---|---|
| Search | Area autocomplete (Hindi + English), chips for type/who | Instant result count "124 ghar mile" |
| Results | Infinite scroll, 20/page; map toggle FAB | Skeleton cards, no spinners |
| Save ♡ | Tap → heart fills, haptic | Toast "Saved. Login karke sync karein" |
| Contact | Sticky bottom bar Call + WhatsApp | OTP sheet slides up (e3), keeps context — never navigates away |
| OTP | 6 boxes, auto-read SMS, resend 30s | Error inline in `--danger` |
| Report | "Galat listing?" link → 3 reason chips | "Shukriya, 24 ghante mein check karenge" |

## 3. Owner — List in ≤ 3 minutes
```mermaid
flowchart TD
  A[Owner landing / List karein free] --> B[Phone OTP]
  B --> C[1. Photos: camera first, min 3]
  C --> D[2. Type, rent, deposit]
  D --> E[3. Location pin + area]
  E --> F[4. Who can stay]
  F --> G[Preview card]
  G --> H[Publish: Live]
  H --> I[Book free verification]
  H --> J[Enquiries on WhatsApp]
  J --> K[Mark as rented]
  K --> M[Offer agreement + police verification]
  A -.alt.-> WA[Send photos on WhatsApp, team lists it]
```
- Progress bar (4 steps), autosave every field, back never loses data.
- Large inputs (48px), numeric keyboard for rent, ₹ prefix, deposit suggestion "2 mahine ka = ₹17,000".
- Day 7 low views → nudge "Boost ₹99 / 7 din" (dismissible, never blocking).

## 4. Auth Flow (single pattern everywhere)
```mermaid
stateDiagram-v2
  [*] --> Anonymous
  Anonymous --> OTPSheet: Contact / Save / List
  OTPSheet --> Verified: correct OTP
  OTPSheet --> Anonymous: dismiss
  Verified --> RoleAsk: first time only
  RoleAsk --> Tenant: Ghar dhoondh raha hoon
  RoleAsk --> Owner: Ghar de raha hoon
  Tenant --> [*]
  Owner --> [*]
```
`/login` and `/signup` collapse into one `AuthScreen` (phone first; Google as secondary). Return user to the exact action they started.

## 5. Logged-in Navigation (mobile bottom nav)
| Tenant | Owner |
|---|---|
| Search · Saved · Messages · Visits · Profile | My listings · Enquiries · Visits · Services · Profile |
Role switch lives in Profile. Analytics / Leads / Documents hidden for MVP (per MASTER §9).

## 6. Edge & Empty States
| State | Copy | Action |
|---|---|---|
| No results | "Is area mein abhi koi room nahi." | Set WhatsApp alert |
| Offline | "Internet nahi hai — saved ghar dekh sakte hain" | Open Saved |
| Listing rented | "Ye ghar mil gaya kisi ko" | Similar homes row |
| OTP fails 3× | "WhatsApp pe OTP bhejein?" | WhatsApp OTP |
| Owner no enquiries 3 days | "Photos better karein — 2x zyada calls" | Edit photos |

## 7. Route Map
| Route | Flow role |
|---|---|
| `/` | Tenant landing (§ LANDING-PAGES 1) |
| `/search` | Results |
| `/property/[id]` | Detail + contact |
| `/how-to-list` | Owner landing (§ LANDING-PAGES 2) |
| `/post-property` | Owner 4-step wizard |
| `/pricing` | Services landing (§ LANDING-PAGES 3) |
| `/login`, `/signup` | Same AuthScreen |
| `/onboarding` | Role ask (one screen) |
| `/(user-app)/*` | Logged-in app |

