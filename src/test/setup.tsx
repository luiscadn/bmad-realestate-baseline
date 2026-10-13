import { vi } from "vitest";
import type { AnchorHTMLAttributes } from "react";

let mockPathname = "/";
let mockSearch = "";

export function setMockLocation(pathname: string, search = "") {
  mockPathname = pathname;
  mockSearch = search;
}

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockSearch),
  usePathname: () => mockPathname,
}));

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => mockPathname,
  Link: ({
    href,
    locale,
    ...rest
  }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { pathname: string; query?: Record<string, string> };
    locale?: string;
  }) => {
    const path = typeof href === "string" ? href : href.pathname;
    const qs =
      typeof href === "string" || !href.query
        ? ""
        : new URLSearchParams(href.query).toString();
    const query = qs ? `?${qs}` : "";
    const prefix = locale && locale !== "es" ? `/${locale}` : "";
    return <a href={`${prefix}${path === "/" && prefix ? "" : path}${query}`} {...rest} />;
  },
}));
