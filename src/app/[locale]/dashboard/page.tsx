import { setRequestLocale } from "next-intl/server";
import DashboardClient from "@/components/DashboardClient";
import { redirect } from "@/i18n/navigation";
import { getSessionAgent } from "@/lib/agent-auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await getSessionAgent())) redirect({ href: "/login", locale });
  return <DashboardClient />;
}
