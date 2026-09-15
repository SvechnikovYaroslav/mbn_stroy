"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

const KEY = "otdelka360_cookie_consent";
const EVENT = "otdelka360:cookie-settings";
type Consent = { analytics: boolean; policyVersion: string; decidedAt: string };

function readConsent(): Consent | null {
  try { const value = localStorage.getItem(KEY); return value ? JSON.parse(value) as Consent : null; } catch { return null; }
}

function subscribeConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function removeMetrikaCookies() {
  for (const name of document.cookie.split(";").map((item) => item.trim().split("=")[0])) {
    if (name.startsWith("_ym") || name.startsWith("yandexuid")) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}

function loadMetrika(id: string) {
  if (document.getElementById("yandex-metrika")) return;
  const script = document.createElement("script");
  script.id = "yandex-metrika";
  script.async = true;
  script.src = `https://mc.yandex.ru/metrika/tag.js`;
  script.onload = () => {
    const ym = (window as Window & { ym?: (...args: unknown[]) => void }).ym;
    ym?.(Number(id), "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });
  };
  document.head.appendChild(script);
}

export function CookieConsent({ metrikaId }: { metrikaId?: string }) {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    if (consent?.analytics && metrikaId) loadMetrika(metrikaId);
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener(EVENT, openSettings);
    return () => window.removeEventListener(EVENT, openSettings);
  }, [consent, metrikaId]);
  function decide(analytics: boolean) {
    localStorage.setItem(KEY, JSON.stringify({ analytics, policyVersion: "1.0", decidedAt: new Date().toISOString() }));
    setSettingsOpen(false);
    if (analytics && metrikaId) loadMetrika(metrikaId);
    if (!analytics) { removeMetrikaCookies(); window.location.reload(); }
  }
  if (!settingsOpen && consent) return null;
  return <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl border border-border bg-card p-4 shadow-2xl" aria-label="Настройки cookies">
    <p className="text-body text-foreground">Мы используем техническое хранилище выбора и, только с вашего согласия, Яндекс Метрику для агрегированной аналитики.</p>
    <p className="mt-2 text-small text-muted-foreground"><Link className="underline underline-offset-4" href="/legal/cookies">Подробнее</Link></p>
    <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => decide(true)} className="bg-primary px-4 py-2 text-small text-primary-foreground">Принять</button><button type="button" onClick={() => decide(false)} className="border border-border px-4 py-2 text-small text-foreground">Отклонить</button></div>
  </aside>;
}

export function openCookieSettings() { window.dispatchEvent(new Event(EVENT)); }
