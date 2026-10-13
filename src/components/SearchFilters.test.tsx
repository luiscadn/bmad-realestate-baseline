import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { routerPush } from "@/test/setup";
import { renderWithIntl } from "@/test/render";
import SearchFilters from "./SearchFilters";

const form = (c: HTMLElement) => c.querySelector("form")!;
const field = (c: HTMLElement, name: string) => c.querySelector(`[name=${name}]`) as HTMLInputElement | HTMLSelectElement;

describe("SearchFilters", () => {
  beforeEach(() => routerPush.mockClear());

  it("is a GET form with all seven controls using the API param names", () => {
    const { container } = renderWithIntl(<SearchFilters values={{}} />);
    expect(form(container).getAttribute("method")).toBe("get");
    const names = [...form(container).querySelectorAll("select, input")].map((e) => e.getAttribute("name"));
    expect(names).toEqual(["operation", "neighborhood", "property_type", "min_price", "max_price", "bedrooms", "bathrooms", "sort"]);
  });

  it("keeps the locale in the no-JS form action", () => {
    expect(form(renderWithIntl(<SearchFilters values={{}} />, "en").container).getAttribute("action")).toBe("/en/search");
    expect(form(renderWithIntl(<SearchFilters values={{}} />, "es").container).getAttribute("action")).toBe("/search");
  });

  it("preselects the active values, including a neighborhood outside the default list", () => {
    const { container } = renderWithIntl(
      <SearchFilters values={{ operation: "rent", neighborhood: "Menga", bedrooms: "2", min_price: "500000", sort: "price_asc" }} />,
    );
    expect(field(container, "operation").value).toBe("rent");
    expect(field(container, "neighborhood").value).toBe("Menga");
    expect(field(container, "bedrooms").value).toBe("2");
    expect(field(container, "min_price").value).toBe("500000");
    expect(field(container, "sort").value).toBe("price_asc");
  });

  it("pushes only non-empty params when a select changes", () => {
    const { container } = renderWithIntl(<SearchFilters values={{}} />);
    fireEvent.change(field(container, "operation"), { target: { value: "sale" } });
    expect(routerPush).toHaveBeenLastCalledWith("/search?operation=sale");
    fireEvent.change(field(container, "bedrooms"), { target: { value: "3" } });
    expect(routerPush).toHaveBeenLastCalledWith("/search?operation=sale&bedrooms=3");
  });

  it("omits the default sort and pushes non-default sorts", () => {
    const { container } = renderWithIntl(<SearchFilters values={{}} />);
    fireEvent.change(field(container, "sort"), { target: { value: "newest" } });
    expect(routerPush).toHaveBeenLastCalledWith("/search");
    fireEvent.change(field(container, "sort"), { target: { value: "price_desc" } });
    expect(routerPush).toHaveBeenLastCalledWith("/search?sort=price_desc");
  });

  it("does not push per keystroke on price inputs, but on blur and submit", () => {
    const { container } = renderWithIntl(<SearchFilters values={{}} />);
    const min = field(container, "min_price");
    fireEvent.change(min, { target: { value: "300000000" } });
    expect(routerPush).not.toHaveBeenCalled();
    fireEvent.blur(min);
    expect(routerPush).toHaveBeenLastCalledWith("/search?min_price=300000000");
    fireEvent.change(field(container, "max_price"), { target: { value: "900000000" } });
    fireEvent.submit(form(container));
    expect(routerPush).toHaveBeenLastCalledWith("/search?min_price=300000000&max_price=900000000");
  });

  it("does not push on blur when an input was not edited", () => {
    const { container } = renderWithIntl(<SearchFilters values={{ min_price: "100" }} />);
    fireEvent.blur(field(container, "min_price"));
    expect(routerPush).not.toHaveBeenCalled();
  });

  it("offers a reset link to a clean /search and translates labels", () => {
    renderWithIntl(<SearchFilters values={{ operation: "sale" }} />, "en");
    expect(screen.getByRole("link", { name: "Clear filters" }).getAttribute("href")).toBe("/search");
    expect(screen.getByLabelText("Bedrooms")).toBeTruthy();
    expect(screen.getByLabelText("Minimum price (COP)")).toBeTruthy();
  });
});
