// Placeholder contact details: replace with the agent's real data before launch.
export const siteConfig = {
  phone: "+57 602 000 0000",
  whatsappNumber: "573000000000",
  email: "contacto@victoriaordonez.co",
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
  "Granada",
  "Ciudad Jardín",
  "El Peñón",
  "Pance",
  "San Antonio",
  "Santa Teresita",
] as const;

export const AGENT_SIGN_IN_HREF = "/login";
