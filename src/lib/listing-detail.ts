import type { ListingImage } from "./listing-images";

export interface ListingAgent {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export interface ListingDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  operation: "sale" | "rent";
  property_type: string;
  price_cop: number | string;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  area_m2: number | string | null;
  stratum: number | null;
  admin_fee_cop: number | string | null;
  neighborhood: string;
  address: string | null;
  city: string;
  open_house_at: string | null;
  images: ListingImage[];
  agent: ListingAgent | null;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Whole-second countdown to `target`, or null when the target is invalid or not strictly in the future. */
export function getCountdown(target: string | null | undefined, now: number): Countdown | null {
  if (!target) return null;
  const at = Date.parse(target);
  if (Number.isNaN(at)) return null;
  const total = Math.floor((at - now) / 1000);
  if (total <= 0) return null;
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export type ContactField = "name" | "email" | "phone" | "message";
export type ContactErrorCode = "required" | "invalid" | "tooLong";
export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

export interface ContactValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Same limits and email rule as the server-side validateLead.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const PHONE_RE = /^\+?[0-9\s().-]{7,}$/;
const MAX = { name: 200, phone: 40, message: 5000 } as const;

/** Phone is optional; the other fields are required. Returns error codes, which the UI maps to messages. */
export function validateContactForm(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const message = values.message.trim();

  if (!name) errors.name = "required";
  else if (name.length > MAX.name) errors.name = "tooLong";
  if (!email) errors.email = "required";
  else if (email.length > 254 || !EMAIL_RE.test(email)) errors.email = "invalid";
  if (phone) {
    if (phone.length > MAX.phone) errors.phone = "tooLong";
    else if (!PHONE_RE.test(phone) || phone.replace(/\D/g, "").length < 7) errors.phone = "invalid";
  }
  if (!message) errors.message = "required";
  else if (message.length > MAX.message) errors.message = "tooLong";
  return errors;
}
