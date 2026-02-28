"use client";

import { FormEvent, useState } from "react";
import { Loader2, MessageSquareText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicSessionId, trackPublicEvent } from "@/lib/publicTracking";

type SubmitState = "idle" | "sending" | "success" | "error";

export function AdvisoryContactForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState<string>("");

  async function onSubmit(formData: FormData): Promise<boolean> {
    setSubmitState("sending");
    setFeedback("");

    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      businessName: String(formData.get("businessName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      monthlyVolume: String(formData.get("monthlyVolume") ?? ""),
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""),
      sessionId: getPublicSessionId(),
      path: typeof window !== "undefined" ? window.location.pathname : "/"
    };

    try {
      const res = await fetch("/api/public/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "No fue posible enviar tu solicitud.");
      }

      trackPublicEvent({
        eventName: "lead_form_submitted",
        metadata: {
          hasPhone: Boolean(payload.phone),
          hasBusinessName: Boolean(payload.businessName)
        }
      });

      setSubmitState("success");
      setFeedback("Recibimos tus datos. Nuestro equipo comercial te contactará pronto.");
      return true;
    } catch (error) {
      setSubmitState("error");
      setFeedback(
        error instanceof Error ? error.message : "No fue posible enviar tu solicitud."
      );
      return false;
    }
  }

  return (
    <section className="rounded-3xl border border-white/15 bg-slate-900/70 p-6 sm:p-8">
      <p className="inline-flex items-center gap-2 rounded-full bg-cyan-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
        <MessageSquareText className="h-3.5 w-3.5" />
        Formulario de asesoría
      </p>
      <h2 className="mt-3 text-3xl font-black text-white">
        Déjanos tus datos y te guiamos para activar tu botón.
      </h2>
      <p className="mt-2 text-slate-300">
        Envíanos tu información y te ayudamos con integración, pruebas y salida
        a producción.
      </p>

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={async (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const ok = await onSubmit(formData);
          if (ok) {
            event.currentTarget.reset();
          }
        }}
      >
        <input
          name="fullName"
          placeholder="Nombre y apellido"
          className="rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
          required
        />
        <input
          name="businessName"
          placeholder="Nombre de tu empresa"
          className="rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
        />
        <input
          type="email"
          name="email"
          placeholder="Correo empresarial"
          className="rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
          required
        />
        <input
          name="phone"
          placeholder="WhatsApp / Teléfono"
          className="rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
        />
        <input
          name="monthlyVolume"
          placeholder="Volumen estimado mensual (opcional)"
          className="rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 sm:col-span-2"
        />
        <textarea
          name="message"
          placeholder="Cuéntanos qué vendes y qué tipo de checkout necesitas."
          className="min-h-28 rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 sm:col-span-2"
        />

        {/* Honeypot anti-bot */}
        <input
          name="website"
          autoComplete="off"
          tabIndex={-1}
          className="hidden"
        />

        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="h-11 bg-cyan-300 px-6 text-slate-950 hover:bg-cyan-200"
            disabled={submitState === "sending"}
          >
            {submitState === "sending" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Quiero asesoría para contratar
              </>
            )}
          </Button>
        </div>
      </form>

      {feedback ? (
        <p
          className={`mt-4 text-sm ${
            submitState === "success" ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {feedback}
        </p>
      ) : null}
    </section>
  );
}
