"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Volume2, VolumeX, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIOrb } from "./ai-orb";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  agentName: string;
  agentAvatar?: string | null;
}

// Mock responses for demo
const mockResponses = [
  "I'd be happy to help you with that! Let me look into this for you.",
  "Great question! Based on our documentation, here's what I can tell you...",
  "I understand your concern. Let me explain how this works.",
  "Thanks for reaching out! I can definitely assist you with this.",
  "That's an interesting point. Here's some additional information that might help.",
];

export function ChatInterface({ agentName, agentAvatar }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm ${agentName}. How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const speakMessage = async (text: string) => {
    if (!audioEnabled) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}&lang=en`);
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.play();
    } catch { setIsSpeaking(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500));

    const responseText = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);

    // Speak the response
    speakMessage(responseText);
  };

  const initials = agentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-gray-200">
            <AvatarFallback className="bg-gray-900 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{agentName}</h3>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setAudioEnabled(!audioEnabled);
            if (audioEnabled) {
              audioRef.current?.pause();
              audioRef.current = null;
              setIsSpeaking(false);
            }
          }}
          className="text-gray-400 hover:text-gray-900"
        >
          {audioEnabled ? (
            <Volume2 className={cn("h-5 w-5", isSpeaking && "text-gray-900")} />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* AI Orb - Show when no messages or agent is speaking */}
      {(messages.length <= 1 || isSpeaking || isLoading) && (
        <div className="absolute inset-x-0 top-24 flex justify-center pointer-events-none z-10">
          <AIOrb
            state={isSpeaking ? "speaking" : isLoading ? "listening" : "idle"}
            size={160}
            className="drop-shadow-2xl"
          />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-gray-50" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback
                  className={cn(
                    message.role === "assistant"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-700"
                  )}
                >
                  {message.role === "assistant" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  message.role === "assistant"
                    ? "bg-white border border-gray-200 text-gray-900 rounded-tl-sm"
                    : "bg-gray-900 text-white rounded-tr-sm"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className={cn(
                  "text-xs mt-1",
                  message.role === "assistant" ? "text-gray-400" : "text-gray-300"
                )}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-900 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
