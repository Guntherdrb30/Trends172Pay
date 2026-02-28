"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CirclePlay,
  Compass,
  MessageCircle,
  Rocket,
  Sparkles,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdvisoryContactForm } from "@/components/public/AdvisoryContactForm";
import { trackPublicEvent } from "@/lib/publicTracking";

type JourneyStep = "video" | "explore" | "demo" | "contract";

const stepOrder: JourneyStep[] = ["video", "explore", "demo", "contract"];

const stepLabels: Record<JourneyStep, string> = {
  video: "Mira el video",
  explore: "Entiende el proceso",
  demo: "Prueba el boton",
  contract: "Activa tu cuenta"
};

function getStepIndex(step: JourneyStep) {
  return stepOrder.indexOf(step);
}

function isExternalVideo(url: string) {
  return /^https?:\/\//i.test(url);
}

function normalizeVideoUrl(rawUrl: string): string {
  const url = rawUrl.trim();
  if (!url) return "";

  if (url.includes("youtube.com/watch?v=")) {
    try {
      const parsed = new URL(url);
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    } catch {}
  }

  if (url.includes("youtu.be/")) {
    try {
      const parsed = new URL(url);
      const videoId = parsed.pathname.replace("/", "");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    } catch {}
  }

  return url;
}

function onlyDigits(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export function ClientJourneyExperience() {
  const [step, setStep] = useState<JourneyStep>("video");
  const videoUrl = normalizeVideoUrl(
    process.env.NEXT_PUBLIC_ONBOARDING_VIDEO_URL ?? ""
  );
  const salesEmail = (process.env.NEXT_PUBLIC_SALES_EMAIL ?? "").trim();
  const whatsappNumber = onlyDigits(
    process.env.NEXT_PUBLIC_SALES_WHATSAPP ?? ""
  );
  const whatsappPrefill = encodeURIComponent(
    process.env.NEXT_PUBLIC_SALES_WHATSAPP_MESSAGE ??
      "Hola, quiero asesoria para contratar el boton de pago."
  );
  const currentIndex = getStepIndex(step);
  const hasWhatsApp = Boolean(whatsappNumber);
  const hasSalesEmail = Boolean(salesEmail);

  const progress = useMemo(
    () => `${Math.round(((currentIndex + 1) / stepOrder.length) * 100)}%`,
    [currentIndex]
  );

  useEffect(() => {
    trackPublicEvent({
      eventName: "public_home_viewed",
      metadata: { initialStep: "video" }
    });
  }, []);

  function advanceTo(nextStep: JourneyStep) {
    setStep(nextStep);
  }

  function onVideoContinue(source: "hero" | "assistant") {
    trackPublicEvent({
      eventName: "video_continue_clicked",
      metadata: { source }
    });
    advanceTo("explore");
  }

  function onLearnMore() {
    trackPublicEvent({
      eventName: "learn_more_clicked",
      metadata: { source: "assistant" }
    });
    advanceTo("explore");
  }

  function onDemoClick(source: string) {
    trackPublicEvent({
      eventName: "demo_started",
      metadata: { source }
    });
    advanceTo("demo");
  }

  function onContractClick(source: string) {
    trackPublicEvent({
      eventName: "contract_clicked",
      metadata: { source }
    });
    advanceTo("contract");
  }

  function onSalesEmailClick(source: string) {
    trackPublicEvent({
      eventName: "sales_email_clicked",
      metadata: { source }
    });
  }

  function onWhatsAppClick(source: string) {
    trackPublicEvent({
      eventName: "whatsapp_clicked",
      metadata: { source }
    });
  }

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#031a26] via-[#082a40] to-[#0c344c] px-6 py-10 shadow-2xl shadow-cyan-950/40 sm:px-10">
        <div className="pointer-events-none absolute -left-24 top-10 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-52 w-52 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-100/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              Onboarding Guiado
            </div>

            <h1 className="text-balance text-4xl font-black leading-tight text-white sm:text-5xl">
              Tu empresa puede cobrar online con boton de pago en menos de 1 dia.
            </h1>

            <p className="max-w-2xl text-base text-cyan-50/85 sm:text-lg">
              Flujo recomendado: miras el video, exploras el proceso, pruebas el
              boton y luego te asesoramos para contratar.
            </p>

            <div className="space-y-2 rounded-2xl border border-white/20 bg-slate-950/35 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-cyan-100/80">
                <span>Progreso de Reconocimiento</span>
                <span>{progress}</span>
              </div>
              <div className="h-2 rounded-full bg-white/20">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-amber-300 transition-all duration-700"
                  style={{ width: progress }}
                />
              </div>
              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                {stepOrder.map((item, idx) => {
                  const done = idx <= currentIndex;
                  return (
                    <div
                      key={item}
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        done
                          ? "border-cyan-200/40 bg-cyan-200/10 text-white"
                          : "border-white/15 bg-slate-900/40 text-slate-300"
                      }`}
                    >
                      <span className="mr-1 text-xs opacity-80">0{idx + 1}</span>
                      {stepLabels[item]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-slate-950/45 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
              <Video className="h-4 w-4" />
              Video: Como contratar Trends172 Pay
            </p>

            {videoUrl && isExternalVideo(videoUrl) ? (
              <div className="aspect-video overflow-hidden rounded-xl border border-white/15 bg-black">
                <iframe
                  src={videoUrl}
                  title="Video onboarding de contratacion"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video rounded-xl border border-dashed border-white/30 bg-slate-900/60 p-5">
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <CirclePlay className="h-12 w-12 text-cyan-200" />
                  <p className="text-sm text-slate-200">
                    Define
                    <code className="ml-1 rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-200">
                      NEXT_PUBLIC_ONBOARDING_VIDEO_URL
                    </code>
                    en tu entorno.
                  </p>
                </div>
              </div>
            )}

            <Button
              className="mt-4 w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200"
              onClick={() => onVideoContinue("hero")}
            >
              Ya vi el video, continuar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section id="recorrido" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5">
          <Compass className="h-8 w-8 text-cyan-300" />
          <h3 className="mt-4 text-xl font-bold text-white">1. Reconoce el flujo</h3>
          <p className="mt-2 text-sm text-slate-300">
            Entiendes como se integra el boton, como cobra tu negocio y que ve
            tu cliente en cada pantalla.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5">
          <Bot className="h-8 w-8 text-amber-300" />
          <h3 className="mt-4 text-xl font-bold text-white">2. Prueba real guiada</h3>
          <p className="mt-2 text-sm text-slate-300">
            Abres el modo demo, simulas un pago y confirmas el recorrido real.
          </p>
          <Button
            className="mt-4 bg-amber-300 text-slate-950 hover:bg-amber-200"
            asChild
          >
            <Link href="/pay/demo" onClick={() => onDemoClick("cards_demo")}>
              Probar modo prueba
            </Link>
          </Button>
        </article>

        <article className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5">
          <Rocket className="h-8 w-8 text-emerald-300" />
          <h3 className="mt-4 text-xl font-bold text-white">3. Contrata y activa</h3>
          <p className="mt-2 text-sm text-slate-300">
            Te asesoramos en registro, configuracion y salida a produccion.
          </p>
          <Button
            className="mt-4 bg-emerald-300 text-slate-950 hover:bg-emerald-200"
            asChild
          >
            <Link href="/signup" onClick={() => onContractClick("cards_signup")}>
              Quiero contratar
            </Link>
          </Button>
        </article>
      </section>

      <section className="rounded-3xl border border-white/15 bg-slate-900/60 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
          Asistente de decision
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Te guiamos segun en que punto estes.
        </h2>

        {step === "video" ? (
          <div className="mt-4 rounded-2xl border border-cyan-200/25 bg-cyan-200/5 p-4">
            <p className="text-slate-200">
              Paso actual: <strong>ver el video</strong>. Cuando termines,
              avanza al reconocimiento de proceso.
            </p>
            <Button className="mt-3 bg-cyan-300 text-slate-950 hover:bg-cyan-200" onClick={onLearnMore}>
              Quiero saber mas
            </Button>
          </div>
        ) : null}

        {step === "explore" ? (
          <div className="mt-4 rounded-2xl border border-amber-200/25 bg-amber-200/5 p-4">
            <p className="text-slate-200">
              El siguiente paso es <strong>probar el boton en modo demo</strong>.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button className="bg-amber-300 text-slate-950 hover:bg-amber-200" asChild>
                <Link href="/pay/demo" onClick={() => onDemoClick("assistant_demo")}>
                  Probar en modo prueba
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-white/25 hover:bg-white/5"
                onClick={() => onContractClick("assistant_skip_demo")}
              >
                Ya entendi, quiero contratar
              </Button>
            </div>
          </div>
        ) : null}

        {step === "demo" ? (
          <div className="mt-4 rounded-2xl border border-emerald-200/25 bg-emerald-200/5 p-4">
            <p className="text-slate-200">
              Si el demo te convencio, te ayudamos a activar tu empresa y publicar
              tu boton de pago.
            </p>
            <Button
              className="mt-3 bg-emerald-300 text-slate-950 hover:bg-emerald-200"
              onClick={() => onContractClick("assistant_after_demo")}
            >
              Quiero contratar con asesoria
            </Button>
          </div>
        ) : null}

        {step === "contract" ? (
          <div className="mt-4 rounded-2xl border border-sky-200/25 bg-sky-200/5 p-4">
            <p className="text-slate-200">
              Ultimo paso: crea tu cuenta y te acompanamos en la activacion.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button className="bg-white text-slate-950 hover:bg-slate-200" asChild>
                <Link
                  href="/signup"
                  onClick={() => onContractClick("assistant_signup")}
                >
                  Crear cuenta y contratar
                </Link>
              </Button>

              {hasSalesEmail ? (
                <Button
                  variant="outline"
                  className="border-sky-200/40 text-sky-100 hover:bg-sky-200/10"
                  asChild
                >
                  <a
                    href={`mailto:${salesEmail}?subject=Asesoria%20de%20compra%20boton%20de%20pago`}
                    onClick={() => onSalesEmailClick("assistant_email")}
                  >
                    Hablar por correo
                  </a>
                </Button>
              ) : null}

              {hasWhatsApp ? (
                <Button
                  variant="outline"
                  className="border-emerald-300/40 text-emerald-100 hover:bg-emerald-200/10"
                  asChild
                >
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappPrefill}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onWhatsAppClick("assistant_whatsapp")}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp directo
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      <section
        id="contratar"
        className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-slate-900 via-slate-900 to-[#123044] p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-cyan-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <BadgeCheck className="h-3.5 w-3.5" />
              Asesoria de compra
            </p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Listo para contratar tu boton de pago?
            </h2>
            <p className="mt-3 text-slate-300">
              Si ya probaste el demo, damos el siguiente paso contigo: te
              asesoramos para activar tu empresa, conectar tu checkout y
              comenzar a cobrar.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-200" asChild>
              <Link href="/signup" onClick={() => onContractClick("bottom_signup")}>
                Contratar ahora
              </Link>
            </Button>

            {hasWhatsApp ? (
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-300/50 text-emerald-100 hover:bg-emerald-200/10"
                asChild
              >
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappPrefill}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onWhatsAppClick("bottom_whatsapp")}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Asesoria por WhatsApp
                </a>
              </Button>
            ) : null}

            {hasSalesEmail ? (
              <Button
                size="lg"
                variant="outline"
                className="border-cyan-200/50 text-cyan-100 hover:bg-cyan-200/10"
                asChild
              >
                <a
                  href={`mailto:${salesEmail}?subject=Asesoria%20para%20boton%20de%20pago`}
                  onClick={() => onSalesEmailClick("bottom_email")}
                >
                  Quiero asesoria
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <AdvisoryContactForm />
    </div>
  );
}
