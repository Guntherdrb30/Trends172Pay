"use client";

export type PublicEventName =
  | "public_home_viewed"
  | "video_continue_clicked"
  | "learn_more_clicked"
  | "demo_started"
  | "contract_clicked"
  | "whatsapp_clicked"
  | "sales_email_clicked"
  | "lead_form_submitted";

interface TrackPayload {
  eventName: PublicEventName;
  metadata?: Record<string, unknown>;
}

const SESSION_KEY = "trends172_public_session_id";

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ps_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function getPublicSessionId(): string {
  if (typeof window === "undefined") return "server";

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const created = generateSessionId();
  window.localStorage.setItem(SESSION_KEY, created);
  return created;
}

export function trackPublicEvent(payload: TrackPayload): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    eventName: payload.eventName,
    path: window.location.pathname,
    referrer: document.referrer || null,
    sessionId: getPublicSessionId(),
    metadata: payload.metadata ?? {}
  });

  try {
    if ("sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/public/track", blob);
      if (sent) return;
    }
  } catch {}

  fetch("/api/public/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => {});
}
