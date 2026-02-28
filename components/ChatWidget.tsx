"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  Bot,
  ImagePlus,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  User,
  X
} from "lucide-react";
import { uploadImage } from "@/app/actions/upload-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Role = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  imageUrl?: string;
};

type ChatApiResponse = {
  reply?: string;
  error?: string;
};

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "installation-welcome",
  role: "assistant",
  content:
    "Soy tu asistente de instalacion. Enviame una captura de tu web o codigo y te guio paso a paso para instalar el boton de pago."
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [pendingImageName, setPendingImageName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = useMemo(() => {
    return Boolean(input.trim() || pendingImageUrl) && !isSending && !isUploadingImage;
  }, [input, pendingImageUrl, isSending, isUploadingImage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  async function onPickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setIsUploadingImage(true);

    try {
      const blob = await uploadImage(formData);
      const url = typeof blob?.url === "string" ? blob.url : "";
      if (!url) {
        throw new Error("No se pudo obtener la URL de la imagen.");
      }

      setPendingImageUrl(url);
      setPendingImageName(file.name);
    } catch (error) {
      console.error("Error uploading image in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content:
            "No pude subir la imagen. Intenta de nuevo con JPG o PNG y un archivo mas liviano."
        }
      ]);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removePendingImage() {
    setPendingImageUrl("");
    setPendingImageName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const text = input.trim();
    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: text || "Necesito ayuda con esta captura para instalar el boton.",
      imageUrl: pendingImageUrl || undefined
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setPendingImageUrl("");
    setPendingImageName("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
            imageUrl: message.imageUrl ?? ""
          }))
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | ChatApiResponse
        | null;

      if (!response.ok) {
        const errorMessage =
          payload?.error ??
          "No pude responder en este momento. Intenta de nuevo en unos segundos.";

        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: errorMessage
          }
        ]);
        return;
      }

      const reply =
        payload?.reply?.trim() ||
        "No tengo respuesta clara aun. Enviame una captura o mas detalle del error.";

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: reply
        }
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content:
            "Ocurrio un error de red. Verifica conexion e intenta de nuevo."
        }
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-indigo-600 shadow-xl transition-all hover:scale-105 hover:bg-indigo-500"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      ) : null}

      {isOpen ? (
        <Card className="flex h-[560px] w-[360px] flex-col overflow-hidden border-indigo-500/20 bg-slate-950 shadow-2xl sm:w-[420px]">
          <div className="flex items-center justify-between border-b border-slate-800 bg-indigo-900/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100">Asistente de Instalacion</p>
                <p className="text-[10px] text-slate-400">
                  Guia por chat + interpretacion de imagen
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full gap-2 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    message.role === "user"
                      ? "border-slate-700 bg-slate-800"
                      : "border-indigo-500/30 bg-indigo-500/10"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-slate-300" />
                  ) : (
                    <Bot className="h-4 w-4 text-indigo-400" />
                  )}
                </div>
                <div
                  className={`max-w-[82%] rounded-2xl border px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "border-indigo-500/20 bg-indigo-600 text-white"
                      : "border-slate-800 bg-slate-900 text-slate-200"
                  }`}
                >
                  {message.content ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  ) : null}
                  {message.imageUrl ? (
                    <img
                      src={message.imageUrl}
                      alt="Captura enviada por el cliente"
                      className="mt-2 max-h-48 w-full rounded-md border border-slate-700 object-cover"
                    />
                  ) : null}
                </div>
              </div>
            ))}

            {isSending ? (
              <div className="flex w-full gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10">
                  <Bot className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-800 bg-slate-950 p-3">
            <div className="mb-2 flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/60 p-2 text-xs text-slate-400">
              <span>Primera prueba de instalacion:</span>
              <a href="/instalacion-prueba" className="text-cyan-300 hover:text-cyan-200">
                Abrir web de prueba
              </a>
            </div>

            {pendingImageUrl ? (
              <div className="mb-2 rounded-md border border-slate-700 bg-slate-900/70 p-2">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                  <span className="truncate">{pendingImageName || "captura-subida"}</span>
                  <button
                    type="button"
                    onClick={removePendingImage}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <img
                  src={pendingImageUrl}
                  alt="Captura lista para enviar al asistente"
                  className="max-h-32 w-full rounded border border-slate-700 object-cover"
                />
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-2">
              <div className="relative flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  className="h-10 flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 pr-24 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Describe donde estas bloqueado..."
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickImage}
                  className="hidden"
                />

                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={isUploadingImage || isSending}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-10 h-8 w-8 rounded-full"
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  type="submit"
                  size="icon"
                  disabled={!canSubmit}
                  className="absolute right-1 h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-500"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
              <p className="text-center text-[10px] text-slate-500">
                Puedes enviar captura de pantalla para diagnostico de instalacion.
              </p>
            </form>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
