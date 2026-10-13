import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import ListingGallery from "./ListingGallery";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text, @typescript-eslint/no-unused-vars
  default: ({ fill, priority, ...props }: Record<string, unknown>) => <img {...props} />,
}));

const img = (n: number, alt: string | null = `Foto ${n}`) => ({
  id: `i${n}`,
  listing_id: "l",
  url: `https://x.test/${n}.jpg`,
  alt_text: alt,
  position: n,
});

describe("ListingGallery", () => {
  it("shows a placeholder without images", () => {
    renderWithIntl(<ListingGallery images={[]} title="Casa" />);
    expect(screen.getByText("Sin fotos")).toBeTruthy();
  });

  it("shows a single image without controls", () => {
    renderWithIntl(<ListingGallery images={[img(1)]} title="Casa" />);
    expect(screen.getByAltText("Foto 1")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("falls back to the title as alt text", () => {
    renderWithIntl(<ListingGallery images={[img(1, null)]} title="Casa Pance" />);
    expect(screen.getByAltText("Casa Pance")).toBeTruthy();
  });

  it("navigates with arrows (wrapping) and thumbnails", () => {
    renderWithIntl(<ListingGallery images={[img(1), img(2), img(3)]} title="Casa" />);
    const main = () => screen.getByAltText(/Foto \d/).getAttribute("src");
    expect(main()).toBe("https://x.test/1.jpg");
    fireEvent.click(screen.getByLabelText("Foto anterior"));
    expect(main()).toBe("https://x.test/3.jpg");
    fireEvent.click(screen.getByLabelText("Foto siguiente"));
    expect(main()).toBe("https://x.test/1.jpg");
    fireEvent.click(screen.getByLabelText("Ver foto 2"));
    expect(main()).toBe("https://x.test/2.jpg");
    expect(screen.getByText("2 de 3")).toBeTruthy();
  });
});
