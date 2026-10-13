import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import OpenHouseBanner from "./OpenHouseBanner";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-13T12:00:00Z"));
});
afterEach(() => vi.useRealTimers());

describe("OpenHouseBanner", () => {
  it("shows the countdown for a future date and ticks", () => {
    renderWithIntl(<OpenHouseBanner openHouseAt="2026-10-14T13:00:10Z" />);
    const countdown = screen.getByTestId("countdown");
    expect(countdown.textContent).toContain("01");
    expect(countdown.textContent).toContain("10");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId("countdown").textContent).toContain("07");
    expect(screen.getByText("Casa abierta", { selector: "p" })).toBeTruthy();
  });

  it("renders in English", () => {
    renderWithIntl(<OpenHouseBanner openHouseAt="2026-10-14T13:00:10Z" />, "en");
    expect(screen.getByText("Starts in")).toBeTruthy();
  });

  it("renders nothing for a past date", () => {
    const { container } = renderWithIntl(<OpenHouseBanner openHouseAt="2026-10-13T11:00:00Z" />);
    expect(container.innerHTML).toBe("");
  });

  it("disappears when the countdown reaches zero", () => {
    const { container } = renderWithIntl(<OpenHouseBanner openHouseAt="2026-10-13T12:00:02Z" />);
    expect(screen.getByTestId("countdown")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(container.innerHTML).toBe("");
  });

  it("shows the event time in Bogota time regardless of the runtime zone", () => {
    renderWithIntl(<OpenHouseBanner openHouseAt="2026-10-14T13:00:10Z" />);
    expect(screen.getByText("miércoles, 14 de octubre de 2026, 8:00")).toBeTruthy();
  });

  it("stops ticking once the event has started", () => {
    renderWithIntl(<OpenHouseBanner openHouseAt="2026-10-13T12:00:02Z" />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(vi.getTimerCount()).toBe(0);
  });
});
