// Elite Miami Luxury Real Estate contact details
export const siteConfig = {
  phone: "+1 305 555 0199",
  whatsappNumber: "13055550199",
  email: "victoria@victoriaordonezluxury.com",
} as const;

export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${siteConfig.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const navItems = [
  { key: "search", href: "/search" },
  { key: "neighborhoods", href: "/neighborhoods" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export const footerNeighborhoods = [
  "Brickell",
  "Downtown Miami",
  "Sunny Isles Beach",
  "Miami Beach",
  "Coconut Grove",
  "Coral Gables",
] as const;

export const AGENT_SIGN_IN_HREF = "/login";
