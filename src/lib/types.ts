export type Role = "GUEST" | "RENTER" | "OWNER" | "BROKER" | "ADMIN";

export type PropertyType =
  | "RK_1"
  | "ROOM_SET_1"
  | "ROOM_SET_2"
  | "BHK_1"
  | "BHK_2"
  | "BHK_3"
  | "FLAT"
  | "INDEPENDENT_HOUSE"
  | "VILLA"
  | "PG"
  | "SHOP"
  | "OFFICE";

export type GenderPreference = "ANY" | "FAMILY" | "STUDENTS" | "BACHELOR" | "MALE" | "FEMALE";

export type FurnishedStatus = "UNFURNISHED" | "SEMI_FURNISHED" | "FULLY_FURNISHED";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";

export type ReportStatus = "PENDING" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: Role;
  activeWorkspace?: string;
  onboardingStatus?: string;
  ownerProfile?: any;
  tenantProfile?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: string;
  url: string;
  propertyId: string;
}

export interface Amenity {
  id: string;
  name: string;
  propertyId: string;
}

export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  user?: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  maintenance: number;
  bedrooms: number;
  bathrooms: number;
  kitchen: number;
  balcony: number;
  parking: boolean;
  floor: number;
  area: number;
  availableFrom: string;
  propertyType: PropertyType;
  genderPreference: GenderPreference;
  waterSupply: string;
  electricity: string;
  internet: boolean;
  isFurnished: FurnishedStatus;
  district: string;
  city: string;
  areaName: string;
  address: string;
  landmark: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  ownerId: string;
  owner?: User;
  images: Image[];
  amenities: Amenity[];
  isVerified: boolean;
  isFeatured: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  property?: Property;
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  query: string | null;
  filters: any;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  propertyId: string | null;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "FAVORITE_UPDATE" | "APPROVAL" | "TRANSACTION" | "CHAT";
  isRead: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  pricePaid: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: string;
  transactionId: string;
  purpose: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporter?: User;
  propertyId: string;
  property?: Property;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}
