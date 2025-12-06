"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    // @ts-ignore - Supressing partial type mismatch with @ai-sdk/react
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
        initialMessages: [
            {
                id: "welcome",
                role: "assistant", // Ensuring role is one of the allowed types
                content: "¡Hola! Soy TrendBot 🤖. Estoy aquí para ayudarte a integrar trends172 Pay."
            }
        ]
    } as any);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
            {/* Botón flotante para abrir/cerrar */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-indigo-600 shadow-xl hover:bg-indigo-500 transition-all hover:scale-105"
                >
                    <MessageSquare className="h-6 w-6 text-white" />
                </Button>
            )}

            {/* Ventana de Chat */}
            {isOpen && (
                <Card className="flex h-[500px] w-[350px] flex-col overflow-hidden border-indigo-500/20 bg-slate-950 shadow-2xl sm:w-[400px]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 bg-indigo-900/20 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-100">Asistente trends172</p>
                                <div className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] text-slate-400">En línea</p>
                                </div>
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

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m: any) => (
                            <div
                                key={m.id}
                                className={`flex w-full gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"
                                    }`}
                            >
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${m.role === "user"
                                        ? "border-slate-700 bg-slate-800"
                                        : "border-indigo-500/30 bg-indigo-500/10"
                                        }`}
                                >
                                    {m.role === "user" ? (
                                        <User className="h-4 w-4 text-slate-300" />
                                    ) : (
                                        <Bot className="h-4 w-4 text-indigo-400" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === "user"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-900 border border-slate-800 text-slate-300"
                                        }`}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === "user" && (
                            <div className="flex w-full gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10">
                                    <Bot className="h-4 w-4 text-indigo-400" />
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="border-t border-slate-800 bg-slate-950 p-3">
                        <div className="relative flex items-center">
                            <input
                                className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Escribe tu pregunta..."
                                value={input}
                                onChange={handleInputChange}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-1 h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-500"
                            >
                                <Send className="h-4 w-4 text-white" />
                            </Button>
                        </div>
                        <p className="mt-2 text-center text-[10px] text-slate-500">
                            IA de soporte • Puede cometer errores.
                        </p>
                    </form>
                </Card>
            )}
        </div>
    );
}
