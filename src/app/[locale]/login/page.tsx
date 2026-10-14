import { getTranslations, setRequestLocale } from "next-intl/server";
import LoginForm from "@/components/LoginForm";
import { redirect } from "@/i18n/navigation";
import { getSessionAgent } from "@/lib/agent-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await getSessionAgent()) redirect({ href: "/dashboard", locale });
  const t = await getTranslations("Login");

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-emerald-950">{t("title")}</h1>
      <p className="mb-6 mt-1 text-sm text-slate-600">{t("subtitle")}</p>
      <LoginForm />
    </div>
  );
}
