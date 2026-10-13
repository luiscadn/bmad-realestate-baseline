import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

function shell(locale: "es" | "en", messages: typeof es) {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header />
      <main />
      <Footer />
    </NextIntlClientProvider>,
  );
}

describe("global layout composition", () => {
  it("renders header and footer in Spanish", () => {
    const html = shell("es", es);
    expect(html).toContain("<header");
    expect(html).toContain("<footer");
    expect(html).toContain("Ingreso Agente");
    expect(html).toContain("Contacto directo");
  });

  it("renders header and footer in English", () => {
    const html = shell("en", en);
    expect(html).toContain("Agent Sign In");
    expect(html).toContain("Direct contact");
  });
});
