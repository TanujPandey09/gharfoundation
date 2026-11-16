# Product Requirements Document (PRD) — Ghar Foundation

Ghar Foundation is a production-ready, mobile-first rental property platform dedicated exclusively to **Uttarakhand, India (Devbhoomi)**. It bridges the gap between renters (students, tourists, local workers) and property owners/brokers, delivering a clean, fast, and lightweight SaaS experience optimized for mountain connectivity.

---

## 1. Executive Summary & Goals

### 1.1 Problem Statement
Uttarakhand's rental market is highly fragmented. Generic portals like MagicBricks or 99acres are cluttered with outdated listings, irrelevant metropolitan filters, high fee paywalls, and heavy resource loads that fail on slow 3G/4G mountain networks. Renters are frequently scammed by duplicate listings or forced to pay exorbitant commissions to middle-tier brokers.

### 1.2 Solution
Ghar Foundation provides:
- A dedicated directory covering all **13 districts** of Uttarakhand.
- Verification checks by administrators to ensure listings correspond to real local spaces.
- A **mobile-first PWA architecture** designed to operate smoothly under low bandwidth.
- A direct, free-of-charge connection channel (WhatsApp/Call/Chat) for verified users.
- Subscriptions and featured listing upgrades for commercial brokers and landlords.

### 1.3 Key Metrics (KPIs)
- **Performance**: Page Load time < 1.5s on 3G connections.
- **Verification Rate**: > 80% of listed properties verified by admin review.
- **User Engagement**: > 40% renter-to-owner WhatsApp redirection success rate.
- **Quality Control**: Suspicious listings flagged and moderated within 4 hours.

---

## 2. User Personas & Scenarios

```mermaid
mindmap
  root((Ghar Users))
    Renter
      Students in Dehradun / Roorkee
      Yoga tourists in Rishikesh
      Working couples in Haldwani
    Owner
      Local landlords in cities
      Mountain cottage owners
    Broker
      Real estate agents seeking premium leads
    Admin
      Ghar moderation team managing trust
```

### 2.1 The Renter
*   **Persona**: Aman, a university student moving to Dehradun.
*   **Scenario**: Needs a budget-friendly 1 RK/PG near his college. He has limited internet data and wants to filter by "Bachelor Friendly" and "Pet Friendly" before contacting the owner directly over WhatsApp.

### 2.2 The Landlord
*   **Persona**: Devendra, a retired officer in Mussoorie.
*   **Scenario**: Owns a cozy wooden cottage in Landour. Wants to post his listing easily on a mobile device, choose "Family Preferred", upload 3 pictures, and receive phone inquiries directly without paying middleman brokerage.

### 2.3 The Professional Broker
*   **Persona**: Satish, owner of Garhwal Properties in Rishikesh.
*   **Scenario**: Manages 15+ rental studios and retail shops. Wants to purchase a monthly "Premium Plan" to feature his properties at the top of search rankings and display a "Verified Broker" badge on his cards.

### 2.4 The Administrator
*   **Persona**: Admin team.
*   **Scenario**: Audits user flags. Checks listings marked as "Fake", reviews landlord credentials, and updates verified badges.

---

## 3. Product Features & Functional Requirements

| Feature ID | Category | Feature Name | Description | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Auth | Multi-Channel Login | Support Clerk Google/Apple SSO, Phone OTP login, and Guest mode. | **P0 (Critical)** |
| **FR-02** | Search | Multi-Tab Search | Custom search bar with category filters (Rentals, PGs, Commercial). | **P0 (Critical)** |
| **FR-03** | Search | Interactive Filters | Quick tags (bachelor, pet, parking) and range selectors for rent. | **P0 (Critical)** |
| **FR-04** | Discovery | Property Map View | Integrated Map displaying property coordinates and nearby landmarks. | **P1 (High)** |
| **FR-05** | Listing | Multi-Step Wizard | Landlord posting wizard (Details, Location, Uploads, Preview). | **P0 (Critical)** |
| **FR-06** | Listing | Photo Gallery | Swipeable image carousel with loading state indicators. | **P0 (Critical)** |
| **FR-07** | Moderation | Abuse Reporting | Renter tool to report listings as fake, misleading, or offline. | **P0 (Critical)** |
| **FR-08** | Moderation | Admin Audit Panel | Admin board to delete flagged items or verify submitted properties. | **P1 (High)** |
| **FR-09** | Monetization | Subscription Manager| Payment tier selection (Basic Free vs Pro Featured listings). | **P1 (High)** |
| **FR-10** | Offline | PWA Offline Support | Local storage caching of properties and details for remote areas. | **P2 (Medium)** |

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Performance & Latency
- The bundle must compile with Next.js static asset optimization.
- Image assets must be optimized dynamically using CDN (Cloudinary / Unsplash resize queries).
- CSS files must prioritize Tailwind variables for dynamic render cycles without render-blocking scripts.

### 4.2 Security & Data Privacy
- SSO redirects must restrict destination URLs to verified domains to protect against Open Redirect vulnerabilities.
- User metadata (roles and onboarding configurations) must be stored in Clerk `publicMetadata` and verified on the server-side middleware.
- Database access keys must never be exposed client-side.

### 4.3 PWA & Responsiveness
- Layouts must be built mobile-first, ensuring high-density layouts resize beautifully down to 320px screens.
- Touch targets for buttons and filters must be at least 44x44px.

---

## 5. Monetization Strategy

Ghar Foundation implements a dual-value monetization strategy:
1.  **Featured Listings (Promoted)**: Landlords pay a small fee to pin their property to the top of search queries and the homepage grid for 7/14/30 days.
2.  **Broker Subscriptions**: Real estate agents pay a monthly flat fee to host unlimited listings, receive a "Verified Agency" badge, and get priority email alerts on prospective tenant inquiries.
3.  **Local Banner Sponsorships**: Space reserved at the bottom of pages for Uttarakhand-based hospitality businesses, homestays, and tour operators (such as wellness retreats in Tapovan).

---

## 6. Verification & Identity Assurance Requirements (Aadhaar & OTP)

### 6.1 Problem & Mandate
Uttarakhand landlords face severe state legal penalties (up to ₹10,000 fine under the Uttarakhand Police Act, Section 83) for hosting unverified tenants. Simultaneously, students and renters are targeted by advance-fee deposit scams. A reliable, scalable identity verification system is required.

### 6.2 Dual-Phase Identity Architecture

```mermaid
flowchart TD
    User([User: Landlord or Tenant]) --> Choice{Verification Flow}
    Choice -->|Phone Authentication| SMS[Fast2SMS OTP Service]
    SMS --> AuthSuccess[Verified Phone Session]
    
    Choice -->|Identity KYC| PhaseChoice{Rollout Phase}
    PhaseChoice -->|Phase 1: Bootstrapped MVP| VCheck[Verhoeff Mathematical Check]
    VCheck --> DocUpload[Aadhaar Photo Upload]
    DocUpload --> AdminQueue[Admin 1-Click Approval Queue]
    AdminQueue --> MaskedStore[Masked Aadhaar Stored: XXXX-XXXX-1234]
    
    PhaseChoice -->|Phase 2: Automated Scale| UIDAI[Surepass / Cashfree API]
    UIDAI --> AadhaarOTP[UIDAI Direct Mobile OTP]
    AadhaarOTP --> GovMatch[Instant Name, DOB, Address & Photo Sync]
```

### 6.3 Cost & Investment Model

| Service Component | Provider / Method | Cost per Transaction | Initial Setup & Recharge | Rollout Priority |
| :--- | :--- | :--- | :--- | :--- |
| **User Phone OTP** | Fast2SMS (Quick OTP Route) | **₹0.20 / SMS** (20 paise) | **₹100** (~500 OTPs, 0 setup fees, no DLT) | **Active (P0)** |
| **Aadhaar Check (Phase 1)** | Client/Server Verhoeff Check + Manual Photo Audit | **₹0.00** | **₹0.00** | **Active (P0)** |
| **Govt Aadhaar OTP (Phase 2)** | Surepass.io / Cashfree Verification Suite | **₹1.50 – ₹2.50 / verification** | **₹1,000 – ₹2,000** wallet balance (~500-800 verifications) | **Post-Launch Scale (P1)** |
| **Enterprise DLT SMS (Phase 3)** | MSG91 / Airtel Enterprise Gateway | ₹0.12 – ₹0.18 / SMS | ₹5,000 one-time TRAI DLT registration + GSTIN | Future High-Volume |

---

## 7. Hyperlocal Area-Wise SEO Strategy (Dominating Uttarakhand #1 Google Rank)

### 7.1 Competitive Positioning vs Portals
National aggregators (99acres, MagicBricks, Housing.com) index broad metro terms (*"Flats in Dehradun"*) but fail entirely on long-tail, high-intent local queries. Ghar Foundation wins by dominating hyperlocal university and hill-specific search niches.

### 7.2 Core Localities & University Hub Targets

```mermaid
graph TD
    SEO[Hyperlocal SEO Engine] --> DDL[Dehradun Student & Family Hubs]
    SEO --> RSH[Rishikesh Workation & Retreat Hubs]
    SEO --> KMN[Kumaon Foothills Hubs]
    
    DDL --> D1["Prem Nagar & Bidholi (UPES Campus)"]
    DDL --> D2["Clement Town (Graphic Era GEU/GEHU)"]
    DDL --> D3["Mussoorie Diversion (DIT & IMS)"]
    DDL --> D4["Rajpur Road & Jakhan (Pacific Mall / Upscale)"]
    
    RSH --> R1["Tapovan & Laxman Jhula (Studios & Fast Wi-Fi)"]
    RSH --> R2["Badrinath Road & Tapovan Sarai"]
    
    KMN --> K1["Haldwani & Kathgodam (Direct Owner Houses)"]
    KMN --> K2["Mussoorie Mall Road & Landour (Cottages)"]
```

### 7.3 SEO Execution Pillars

1. **Programmatic Area & College Landing Routes**:
   - Query-driven URLs: `/search?city=Dehradun&q=Bidholi`, `/search?city=Dehradun&q=Clement+Town`, `/search?city=Rishikesh&q=Tapovan`.
   - Each route dynamically injects localized H1s, live property count, typical rent brackets, and nearby landmark distances.
2. **High-CTR Title Tag & Meta Snippet Framework**:
   - *Title Formula*: `Rooms & Flats for Rent in [Locality], [City] (No Brokerage) | Direct Owners`
   - *Description Formula*: `Save ₹15,000+ brokerage on verified 1 RK, 1/2 BHK rooms in [Locality]. Call direct owners today. Uttarakhand Police form pre-filled.`
3. **High-Intent Lead Magnet**:
   - The `/police-verification` dossier tool targets thousands of monthly landlords searching for *"Uttarakhand police tenant verification online form"*.
4. **Google Business Profile (Local 3-Pack Domination)**:
   - Establish physical presence at IT Park Dehradun to capture the Google Maps 3-Pack widget which displays above all organic web results on mobile searches.
5. **Technical Structured Data**:
   - Full `RealEstateListingService`, `BreadcrumbList`, and `FAQPage` JSON-LD schema embedded across all layouts to earn rich snippet stars and FAQ accordions on Google SERP.

---

> [!NOTE]
> This PRD serves as the source of truth for the product team. Any deviations or modifications to features must be signed off during regular sprint planning audits.
