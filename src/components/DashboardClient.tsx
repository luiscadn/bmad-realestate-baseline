"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { AgentListing } from "@/lib/dashboard";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import ListingForm from "./ListingForm";
import ListingsTable from "./ListingsTable";

type View = { mode: "list" } | { mode: "form"; listing?: AgentListing };
type Load = "loading" | "ready" | "error";

const LIST_URL = "/api/agent/listings?limit=50";

export default function DashboardClient() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  // Keep `refresh` stable even if the router object identity changes between renders.
  const routerRef = useRef(router);
  routerRef.current = router;
  const [view, setView] = useState<View>({ mode: "list" });
  const [listings, setListings] = useState<AgentListing[]>([]);
  const [load, setLoad] = useState<Load>("loading");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionFailed, setActionFailed] = useState(false);

  const refresh = useCallback(async () => {
    setLoad("loading");
    try {
      const res = await fetch(LIST_URL, { signal: AbortSignal.timeout(15_000) });
      if (res.status === 401) return routerRef.current.push("/login");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      setListings(body.data ?? []);
      setLoad("ready");
    } catch {
      setLoad("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function mutate(listing: AgentListing, init: RequestInit, apply: () => void) {
    setBusyId(listing.id);
    setActionFailed(false);
    try {
      const res = await fetch(`/api/agent/listings/${listing.id}`, { ...init, signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      apply();
    } catch {
      setActionFailed(true);
    } finally {
      setBusyId(null);
    }
  }

  const togglePublish = (l: AgentListing) => {
    const publish = l.published_at === null;
    return mutate(
      l,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: publish }) },
      () => setListings((all) => all.map((x) => (x.id === l.id ? { ...x, published_at: publish ? new Date().toISOString() : null } : x))),
    );
  };

  const remove = (l: AgentListing) =>
    mutate(l, { method: "DELETE" }, () => setListings((all) => all.filter((x) => x.id !== l.id)));

  async function signOut() {
    try {
      await createBrowserSupabase().auth.signOut();
    } finally {
      router.push("/login");
    }
  }

  function saved() {
    setView({ mode: "list" });
    void refresh();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-emerald-950">{t("title")}</h1>
        <div className="flex gap-3">
          {view.mode === "list" && (
            <button
              type="button"
              onClick={() => setView({ mode: "form" })}
              className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              {t("newListing")}
            </button>
          )}
          <button type="button" onClick={signOut} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            {t("signOut")}
          </button>
        </div>
      </div>

      {view.mode === "form" ? (
        <ListingForm key={view.listing?.id ?? "new"} listing={view.listing} onSaved={saved} onCancel={() => setView({ mode: "list" })} />
      ) : (
        <>
          {actionFailed && (
            <p role="alert" className="text-sm text-red-600">
              {t("actionError")}
            </p>
          )}
          {load === "loading" && <p role="status" className="text-sm text-slate-500">{t("loading")}</p>}
          {load === "error" && (
            <div role="alert" className="flex items-center gap-3 text-sm text-red-600">
              <span>{t("loadError")}</span>
              <button type="button" onClick={() => void refresh()} className="rounded-md border border-red-300 px-2.5 py-1 font-medium">
                {t("retry")}
              </button>
            </div>
          )}
          {load === "ready" && listings.length === 0 && <p className="text-sm text-slate-500">{t("empty")}</p>}
          {load === "ready" && listings.length > 0 && (
            <ListingsTable
              listings={listings}
              busyId={busyId}
              onEdit={(listing) => setView({ mode: "form", listing })}
              onTogglePublish={togglePublish}
              onDelete={remove}
            />
          )}
        </>
      )}
    </div>
  );
}
