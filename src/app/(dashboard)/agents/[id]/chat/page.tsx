"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { AIOrb } from "@/components/chat/ai-orb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Send,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Loader2,
  ArrowLeft,
  Bug,
  Settings,
  PhoneOff,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Agent {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  firstMessage: string | null;
  language: string;
  systemPrompt: string;
  voiceEnabled: boolean;
  voiceId: string | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isVoiceInput?: boolean;
  createdAt: string;
  responseTime?: number;
}

const voicePresets = [
  { id: "rachel",  name: "Rachel",  gender: "Female", accent: "American",  pitch: 1.1,  rate: 1.15, ttsLang: "en",    ttsVoice: "Joanna"  },
  { id: "sarah",   name: "Sarah",   gender: "Female", accent: "Australian", pitch: 1.2,  rate: 1.10, ttsLang: "en-au", ttsVoice: "Nicole"  },
  { id: "domi",    name: "Domi",    gender: "Female", accent: "American",  pitch: 1.3,  rate: 1.40, ttsLang: "en",    ttsVoice: "Salli"   },
  { id: "jessica", name: "Jessica", gender: "Female", accent: "British",   pitch: 0.95, rate: 1.05, ttsLang: "en-gb", ttsVoice: "Amy"     },
  { id: "bella",   name: "Bella",   gender: "Female", accent: "Irish",     pitch: 1.05, rate: 1.20, ttsLang: "en-ie", ttsVoice: "Emma"    },
  { id: "drew",    name: "Drew",    gender: "Male",   accent: "American",  pitch: 0.9,  rate: 1.35, ttsLang: "en",    ttsVoice: "Matthew" },
  { id: "clyde",   name: "Clyde",   gender: "Male",   accent: "American",  pitch: 0.7,  rate: 1.15, ttsLang: "en",    ttsVoice: "Joey"    },
  { id: "paul",    name: "Paul",    gender: "Male",   accent: "Australian", pitch: 1.0,  rate: 1.30, ttsLang: "en-au", ttsVoice: "Russell" },
  { id: "dave",    name: "Dave",    gender: "Male",   accent: "British",   pitch: 0.95, rate: 1.28, ttsLang: "en-gb", ttsVoice: "Brian"   },
  { id: "adam",    name: "Adam",    gender: "Male",   accent: "Indian",    pitch: 0.8,  rate: 1.22, ttsLang: "en-in", ttsVoice: "Justin"  },
];

export default function AgentChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: agentId } = use(params);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [pageError, setPageError] = useState("");
  const [chatError, setChatError] = useState("");
  const [started, setStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Voice state
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [callDuration, setCallDuration] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioLevelFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callStartRef = useRef<number>(0);
  const sessionRecorderRef = useRef<MediaRecorder | null>(null);
  const sessionChunksRef = useRef<Blob[]>([]);
  const convIdRef = useRef<string | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mixedDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const ttsSourceRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const isRecordingRef = useRef(false);

  // ── Fetch agent ───────────────────────────────────────────────────
  const fetchAgent = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}`);
      if (!res.ok) throw new Error("Not found");
      setAgent(await res.json());
    } catch { setPageError("Agent not found."); }
    finally { setIsLoading(false); }
  }, [agentId]);

  // ── Speech recognition setup ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSpeechSupported(false); return; }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = agent?.language === "en" ? "en-US" : agent?.language || "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      if (final) { setTranscript(p => (p + " " + final).trim()); setInterimTranscript(""); }
      else setInterimTranscript(interim);
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (["no-speech", "aborted", "audio-capture", "network"].includes(e.error)) return;
      setIsRecording(false);
    };
    rec.onend = () => { if (isRecordingRef.current) { try { rec.start(); } catch { /* */ } } };
    recognitionRef.current = rec;
    return () => { try { rec.abort(); } catch { /* */ } };
  }, [agent?.language]);

  useEffect(() => { fetchAgent(); }, [fetchAgent]);
  useEffect(() => { convIdRef.current = conversationId; }, [conversationId]);

  const activeVoice = voicePresets.find(v => v.id === agent?.voiceId) ?? voicePresets[0];

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatError) { const t = setTimeout(() => setChatError(""), 5000); return () => clearTimeout(t); }
  }, [chatError]);

  // Voice state sync
  useEffect(() => {
    if (isSpeaking) setVoiceState("speaking");
    else if (isSending) setVoiceState("thinking");
    else if (isRecording) setVoiceState("listening");
    else setVoiceState("idle");
  }, [isRecording, isSending, isSpeaking]);

  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  // Call timer
  useEffect(() => {
    if (started && !callTimerRef.current) {
      if (!callStartRef.current) callStartRef.current = Date.now();
      callTimerRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartRef.current) / 1000));
      }, 1000);
    }
    return () => {
      if (!started && callTimerRef.current) { clearInterval(callTimerRef.current); callTimerRef.current = null; }
    };
  }, [started]);

  // ── Save recording ────────────────────────────────────────────────
  const saveCurrentRecording = useCallback(() => {
    const recorder = sessionRecorderRef.current;
    const convId = convIdRef.current;
    if (!recorder || recorder.state === "inactive" || sessionChunksRef.current.length === 0 || !convId) return;
    const blob = new Blob(sessionChunksRef.current, { type: recorder.mimeType || "audio/webm" });
    if (blob.size < 100) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      fetch(`/api/conversations/${convId}/recording`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl: reader.result }),
      }).catch(() => {});
    };
    reader.readAsDataURL(blob);
  }, []);

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") saveCurrentRecording(); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [saveCurrentRecording]);

  // ── Begin conversation ────────────────────────────────────────────
  const beginConversation = async () => {
    if (!agent) return;
    window.speechSynthesis?.cancel();
    try {
      const res = await fetch(`/api/agents/${agent.id}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: agent.voiceEnabled ? "voice" : "text", source: "dashboard" }),
      });
      if (!res.ok) throw new Error("Failed to start");
      const conv = await res.json();
      setConversationId(conv.id);
      setStarted(true);

      try {
        const recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = recStream;
        sessionChunksRef.current = [];
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        const mixedDest = ctx.createMediaStreamDestination();
        mixedDestRef.current = mixedDest;
        const micSrc = ctx.createMediaStreamSource(recStream);
        micSourceRef.current = micSrc;
        micSrc.connect(mixedDest);
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
        const recorder = new MediaRecorder(mixedDest.stream, mimeType ? { mimeType, audioBitsPerSecond: 128000 } : { audioBitsPerSecond: 128000 });
        recorder.ondataavailable = (e) => { if (e.data.size > 0) sessionChunksRef.current.push(e.data); };
        recorder.start(1000);
        sessionRecorderRef.current = recorder;
      } catch { /* mic permission denied — skip recording */ }

      const msgRes = await fetch(`/api/conversations/${conv.id}/messages`);
      if (msgRes.ok) {
        const msgs = await msgRes.json();
        setMessages(msgs);
        if (msgs.length > 0 && audioEnabled && agent.voiceEnabled) {
          speakMessage(msgs[0].content);
        } else if (speechSupported) {
          setTimeout(() => startListening(), 300);
        }
      }
    } catch (err) {
      console.error("Start error:", err);
      setChatError("Failed to start conversation.");
    }
  };

  // ── Audio level ───────────────────────────────────────────────────
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    setAudioLevel(Math.min(data.reduce((s, v) => s + v, 0) / data.length / 128, 1));
    audioLevelFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || !speechSupported) return;
    try {
      let stream = micStreamRef.current;
      if (!stream || stream.getTracks().some(t => t.readyState === "ended")) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
      }
      mediaStreamRef.current = stream;
      const ctx = audioContextRef.current;
      if (ctx) {
        if (ctx.state === "suspended") await ctx.resume();
        if (micSourceRef.current && mixedDestRef.current) {
          try { micSourceRef.current.connect(mixedDestRef.current); } catch { /* */ }
        }
        if (analyserRef.current && micSourceRef.current) {
          try { micSourceRef.current.disconnect(analyserRef.current); } catch { /* */ }
        }
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.8;
        if (micSourceRef.current) micSourceRef.current.connect(analyser);
        analyserRef.current = analyser;
        updateAudioLevel();
      }
      try { recognitionRef.current.abort(); } catch { /* */ }
      recognitionRef.current.start();
      isRecordingRef.current = true;
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      setChatError("Could not access microphone.");
    }
  }, [speechSupported, updateAudioLevel]);

  const stopListening = useCallback(() => {
    isRecordingRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* */ }
    mediaStreamRef.current = null;
    if (audioLevelFrameRef.current) cancelAnimationFrame(audioLevelFrameRef.current);
    analyserRef.current = null;
    setIsRecording(false); setAudioLevel(0);
  }, []);

  const pickSynthVoice = (voices: SpeechSynthesisVoice[], preset: typeof voicePresets[0]) => {
    const byName = (v: SpeechSynthesisVoice) => v.name.toLowerCase();
    if (preset.gender === "Female") {
      return voices.find(v => byName(v).includes("female") || byName(v).includes("samantha") ||
        byName(v).includes("victoria") || byName(v).includes("karen") ||
        byName(v).includes("zira") || byName(v).includes("hazel"));
    }
    return voices.find(v => byName(v).includes("male") || byName(v).includes("daniel") ||
      byName(v).includes("alex") || byName(v).includes("david") ||
      byName(v).includes("james") || byName(v).includes("mark"));
  };

  const speakMessage = async (text: string) => {
    if (!audioEnabled || typeof window === "undefined") return;
    ttsAbortRef.current?.abort();
    if (ttsSourceRef.current) { ttsSourceRef.current.pause(); ttsSourceRef.current = null; }
    if (micSourceRef.current && mixedDestRef.current) {
      try { micSourceRef.current.disconnect(mixedDestRef.current); } catch { /* */ }
    }
    try { recognitionRef.current?.stop(); } catch { /* */ }
    isRecordingRef.current = false;
    setIsRecording(false); setAudioLevel(0);

    const ctx = audioContextRef.current;
    const mixedDest = mixedDestRef.current;
    const controller = new AbortController();
    ttsAbortRef.current = controller;
    const ttsLang = activeVoice.ttsLang;
    const rate = activeVoice.rate;

    const reconnectMic = () => {
      if (micSourceRef.current && mixedDestRef.current) {
        try { micSourceRef.current.connect(mixedDestRef.current); } catch { /* */ }
      }
      if (!isRecordingRef.current) setTimeout(() => startListening(), 300);
    };

    if (ctx && mixedDest) {
      try {
        const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}&lang=${ttsLang}`, { signal: controller.signal });
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = rate;
        if (ctx.state === "suspended") await ctx.resume();
        const mediaSource = ctx.createMediaElementSource(audio);
        mediaSource.connect(ctx.destination);
        mediaSource.connect(mixedDest);
        ttsSourceRef.current = audio;
        setIsSpeaking(true);
        audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); ttsSourceRef.current = null; reconnectMic(); };
        audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); ttsSourceRef.current = null; reconnectMic(); };
        audio.play().catch(() => { setIsSpeaking(false); URL.revokeObjectURL(url); ttsSourceRef.current = null; reconnectMic(); });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setIsSpeaking(false);
        reconnectMic();
      }
    } else {
      // No AudioContext — use Web Speech API as fallback
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.pitch = activeVoice.pitch; utt.rate = activeVoice.rate;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) { const match = pickSynthVoice(voices, activeVoice); if (match) utt.voice = match; }
      utt.onstart = () => setIsSpeaking(true);
      utt.onend = () => {
        setIsSpeaking(false);
        if (!isRecordingRef.current) setTimeout(() => startListening(), 300);
      };
      utt.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utt);
    }
  };

  // ── Send message ──────────────────────────────────────────────────
  const sendMessage = async (content: string, isVoice: boolean) => {
    const text = content.trim();
    if (!text || !conversationId || isSending) return;
    setIsSending(true); setChatError("");

    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = { id: tempId, role: "user", content: text, isVoiceInput: isVoice, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: text, isVoiceInput: isVoice }),
      });
      if (!res.ok) throw new Error("Failed to send");

      const { userMessage, assistantMessage } = await res.json();
      setMessages(prev => {
        const updated = [...prev.filter(m => m.id !== tempId), userMessage];
        if (assistantMessage) updated.push(assistantMessage);
        return updated;
      });
      if (assistantMessage) {
        if (audioEnabled) speakMessage(assistantMessage.content);
        setTimeout(() => saveCurrentRecording(), 1200);
      }
    } catch (err) {
      console.error("Send error:", err);
      setChatError("Failed to send. Please try again.");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally { setIsSending(false); }
  };

  const handleSendText = () => {
    if (!input.trim()) return;
    if (isRecording) { setTranscript(""); setInterimTranscript(""); stopListening(); }
    const text = input; setInput("");
    sendMessage(text, false);
  };

  const autoSendVoice = (text: string) => {
    setTranscript(""); setInterimTranscript("");
    isRecordingRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* */ }
    if (audioLevelFrameRef.current) cancelAnimationFrame(audioLevelFrameRef.current);
    mediaStreamRef.current = null;
    if (micSourceRef.current && mixedDestRef.current) {
      try { micSourceRef.current.disconnect(mixedDestRef.current); } catch { /* */ }
    }
    analyserRef.current = null;
    setIsRecording(false); setAudioLevel(0);
    sendMessage(text, true);
  };

  const endCall = () => {
    ttsAbortRef.current?.abort();
    if (ttsSourceRef.current) { ttsSourceRef.current.pause(); ttsSourceRef.current = null; }
    if (conversationId) {
      fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ended", duration: callDuration }),
      }).catch(() => {});
    }
    saveCurrentRecording();
    const recorder = sessionRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      const convId = conversationId;
      recorder.onstop = () => {
        micStreamRef.current?.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
        const blob = new Blob(sessionChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size > 100 && convId) {
          const reader = new FileReader();
          reader.onloadend = () => {
            fetch(`/api/conversations/${convId}/recording`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audioUrl: reader.result }),
            }).catch(() => {});
          };
          reader.readAsDataURL(blob);
        }
        sessionRecorderRef.current = null;
      };
      recorder.stop();
    }
    stopListening();
    if (audioContextRef.current) { audioContextRef.current.close().catch(() => {}); audioContextRef.current = null; }
    mixedDestRef.current = null;
    micSourceRef.current = null;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false); setTranscript(""); setInterimTranscript("");
    if (callTimerRef.current) { clearInterval(callTimerRef.current); callTimerRef.current = null; }
    setCallEnded(true);
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const initials = agent?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AI";

  // ── Loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (pageError || !agent) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500">{pageError || "Agent not found."}</p>
          <Link href="/agents">
            <Button variant="link" className="text-gray-900 mt-4">Back to Agents</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/agents/${agentId}`}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Agent</h1>
            <p className="text-gray-500 text-sm">Testing: {agent.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="debug-mode" checked={debugMode} onCheckedChange={setDebugMode} />
            <Label htmlFor="debug-mode" className="text-sm text-gray-600 flex items-center gap-1">
              <Bug className="h-4 w-4" /> Debug
            </Label>
          </div>
          <Link href={`/agents/${agentId}`}>
            <Button variant="outline" className="border-gray-300">
              <Settings className="h-4 w-4 mr-2" /> Agent Settings
            </Button>
          </Link>
        </div>
      </div>

      <div className={cn("flex-1 min-h-0 grid gap-6", debugMode ? "md:grid-cols-3" : "")}>
        {/* ── Main conversation area ── */}
        <div className={cn("bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0", debugMode ? "md:col-span-2" : "")}>
          {!started ? (
            /* ── Start screen ── */
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-6">
              <div className="relative overflow-visible">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl scale-150" />
                <div className="relative overflow-visible">
                  <AIOrb state="idle" size={200} className="drop-shadow-2xl" />
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">{agent.name}</h2>
                {agent.description && (
                  <p className="text-sm text-gray-500 max-w-sm">{agent.description}</p>
                )}
              </div>

              <button
                onClick={beginConversation}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all text-base shadow-lg hover:shadow-xl hover:scale-105"
              >
                Begin Conversation
              </button>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                {agent.voiceEnabled && speechSupported && (
                  <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
                    <Mic className="h-3.5 w-3.5 text-blue-600" /> Voice
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Send className="h-3.5 w-3.5 text-gray-600" /> Text
                </span>
                {agent.voiceEnabled && (
                  <span className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full">
                    <Volume2 className="h-3.5 w-3.5 text-indigo-600" /> Audio
                  </span>
                )}
              </div>

              {agent.voiceEnabled && !speechSupported && (
                <p className="text-xs text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                  Voice requires Chrome, Edge, or Safari
                </p>
              )}
              {chatError && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{chatError}</p>}
            </div>
          ) : (
            /* ── Active conversation ── */
            <div className="flex flex-col flex-1 min-h-0">
              {/* Chat header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white shadow-md">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-500">
                      {callEnded
                        ? `Call ended · ${fmtTime(callDuration)}`
                        : <>
                            {voiceState === "listening" && "Listening..."}
                            {voiceState === "thinking" && "Thinking..."}
                            {voiceState === "speaking" && "Speaking..."}
                            {voiceState === "idle" && "Connected"}
                            {callDuration > 0 && ` · ${fmtTime(callDuration)}`}
                          </>
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    {audioEnabled
                      ? <Volume2 className={cn("h-4 w-4", isSpeaking ? "text-indigo-600" : "text-gray-600")} />
                      : <VolumeX className="h-4 w-4 text-gray-400" />
                    }
                  </button>
                </div>
              </div>

              {/* Messages */}
              {messages.length > 0 && (
                <div className="flex-1 overflow-y-auto px-5 py-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-md",
                          msg.role === "assistant" ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white" : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                        )}>
                          {msg.role === "assistant" ? initials[0] : "U"}
                        </div>
                        <div className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
                          msg.role === "assistant"
                            ? "bg-white text-gray-900 border border-gray-200"
                            : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                        )}>
                          {msg.isVoiceInput && (
                            <span className={cn("text-xs flex items-center gap-1 mb-1.5", msg.role === "user" ? "text-white/80" : "text-blue-600")}>
                              <Mic className="h-3 w-3" /> Voice input
                            </span>
                          )}
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <span className={cn("text-xs mt-1.5 block", msg.role === "assistant" ? "text-gray-400" : "text-white/60")}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}
                    {isSending && (
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-xs text-white font-semibold shadow-md">{initials[0]}</div>
                        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orb section */}
              <div className={cn(
                "flex flex-col items-center px-5 py-4 border-t border-gray-100",
                messages.length === 0 ? "flex-1 justify-center" : ""
              )}>
                {callEnded ? (
                  <div className="text-center py-4">
                    <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                      <PhoneOff className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Call Ended</p>
                    <p className="text-xs text-gray-500 mt-1">{messages.length} messages · {fmtTime(callDuration)}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
                    >
                      Start New
                    </button>
                  </div>
                ) : (
                  <>
                    <AIOrb
                      state={voiceState === "thinking" ? "listening" : voiceState}
                      size={messages.length > 0 ? 140 : 180}
                      audioLevel={audioLevel}
                      className="drop-shadow-xl"
                    />
                    <div className="mt-3 min-h-[32px] max-w-lg text-center px-4">
                      {(transcript || interimTranscript) && voiceState === "listening" && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {transcript}<span className="text-gray-400">{interimTranscript}</span>
                        </p>
                      )}
                      {voiceState === "thinking" && (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                          <p className="text-sm text-gray-600">Processing...</p>
                        </div>
                      )}
                      {voiceState === "idle" && messages.length === 0 && (
                        <p className="text-sm text-gray-500">Say something or type below to start...</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Error */}
              {chatError && (
                <div className="mx-5 mb-2 px-4 py-2 bg-red-50 text-red-700 text-sm rounded-xl text-center border border-red-200">
                  {chatError}
                </div>
              )}

              {/* Input area */}
              {!callEnded && (
                <div className="border-t border-gray-200 bg-white/90 backdrop-blur-sm px-5 py-4">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSendText(); }}
                    className="flex items-center gap-3"
                  >
                    {speechSupported && (
                      <button
                        type="button"
                        disabled={isSpeaking}
                        onClick={() => {
                          if (isRecording) {
                            const txt = transcript.trim();
                            if (txt) { autoSendVoice(txt); } else { stopListening(); }
                          } else {
                            setTranscript(""); setInterimTranscript("");
                            startListening();
                          }
                        }}
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md",
                          isSpeaking
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : isRecording
                              ? "bg-red-500 text-white shadow-red-500/40 hover:bg-red-600 scale-110"
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105"
                        )}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                    )}

                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isSpeaking ? "Agent is speaking..." : isRecording ? "Listening... or type here" : "Type a message..."}
                      disabled={isSending || isSpeaking}
                      className="flex-1 h-10 bg-white border-gray-200 text-sm focus:border-blue-400 rounded-xl"
                    />

                    <button
                      type="submit"
                      disabled={!input.trim() || isSending || isSpeaking}
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md",
                        input.trim() && !isSending && !isSpeaking
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105"
                          : "bg-gray-100 text-gray-300"
                      )}
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={endCall}
                      className="h-10 w-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition hover:scale-105 shrink-0 shadow-md"
                    >
                      <PhoneOff className="h-4 w-4" />
                    </button>
                  </form>

                  {isRecording && transcript.trim() && (
                    <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-gray-700">
                        <Mic className="h-3.5 w-3.5 inline mr-1.5 text-blue-600" />
                        {transcript}<span className="text-gray-400">{interimTranscript}</span>
                        <button onClick={() => autoSendVoice(transcript.trim())} className="ml-3 text-blue-600 hover:text-blue-700 font-semibold">
                          Send
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Debug Panel ── */}
        {debugMode && (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 text-base flex items-center gap-2">
                <Bug className="h-4 w-4" /> Debug Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Agent ID</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 block overflow-x-auto">{agent.id}</code>
              </div>
              {conversationId && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Conversation ID</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 block overflow-x-auto">{conversationId}</code>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Voice State</p>
                <span className="text-sm text-gray-900 capitalize">{voiceState}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Messages</p>
                <p className="text-sm text-gray-900">{messages.length}</p>
              </div>
              {callDuration > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Duration</p>
                  <p className="text-sm text-gray-900">{fmtTime(callDuration)}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">System Prompt</p>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">{agent.systemPrompt}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">First Message</p>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{agent.firstMessage || "Not set"}</p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">Testing mode provides a sandbox environment to test your agent configuration before publishing.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
