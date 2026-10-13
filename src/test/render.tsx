import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

const catalogs = { es, en } as const;

export function renderWithIntl(ui: ReactElement, locale: "es" | "en" = "es") {
  return render(
    <NextIntlClientProvider locale={locale} messages={catalogs[locale]}>
      {ui}
    </NextIntlClientProvider>,
  );
}
