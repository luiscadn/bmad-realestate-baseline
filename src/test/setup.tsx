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

export const routerPush = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  usePathname: () => mockPathname,
  Link: ({
    href,
    locale,
    ...rest
  }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { pathname: string; query?: Record<string, string | string[]> };
    locale?: string;
  }) => {
    const path = typeof href === "string" ? href : href.pathname;
    const qs =
      typeof href === "string" || !href.query
        ? ""
        : new URLSearchParams(
            Object.entries(href.query).flatMap(([k, v]) =>
              (Array.isArray(v) ? v : [v]).map((item): [string, string] => [k, item]),
            ),
          ).toString();
    const query = qs ? `?${qs}` : "";
    const prefix = locale && locale !== "es" ? `/${locale}` : "";
    return <a href={`${prefix}${path === "/" && prefix ? "" : path}${query}`} {...rest} />;
  },
}));
