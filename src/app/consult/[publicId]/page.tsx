"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { AIOrb } from "@/components/chat/ai-orb";
import {
  Send,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Loader2,
  AlertCircle,
  PhoneOff,
  ChevronDown,
  Play,
  Square,
  Copy,
  CheckCheck,
  ChevronsDown,
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
  widgetTheme: string;
  widgetColor: string;
  voiceEnabled: boolean;
  voiceId: string | null;
  voiceStability: number;
  voiceSimilarityBoost: number;
  voiceStyleExaggeration: number;
  voiceSpeakerBoost: boolean;
  allowInterrupt: boolean;
  silenceTimeout: number;
  endCallOnGoodbye: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  isVoiceInput?: boolean;
  createdAt: string;
}

// Voice presets — defines pitch/rate/ttsLang for each voice.
// ttsLang drives the Google TTS accent (en, en-gb, en-au, en-ie).
const voicePresets = [
  // ── Female Voices (5) — StreamElements/Amazon Polly ───────────────────────
  { id: "rachel",  name: "Rachel",  gender: "Female", accent: "American",   pitch: 1.1,  rate: 1.15, ttsLang: "en",     ttsVoice: "Joanna"  },
  { id: "sarah",   name: "Sarah",   gender: "Female", accent: "Australian",  pitch: 1.2,  rate: 1.10, ttsLang: "en-au",  ttsVoice: "Nicole"  },
  { id: "domi",    name: "Domi",    gender: "Female", accent: "American",   pitch: 1.3,  rate: 1.40, ttsLang: "en",     ttsVoice: "Salli"   },
  { id: "jessica", name: "Jessica", gender: "Female", accent: "British",    pitch: 0.95, rate: 1.05, ttsLang: "en-gb",  ttsVoice: "Amy"     },
  { id: "bella",   name: "Bella",   gender: "Female", accent: "Irish",      pitch: 1.05, rate: 1.20, ttsLang: "en-ie",  ttsVoice: "Emma"    },

  // ── Male Voices (5) — StreamElements/Amazon Polly ─────────────────────────
  { id: "drew",  name: "Drew",  gender: "Male", accent: "American",   pitch: 0.9,  rate: 1.35, ttsLang: "en",     ttsVoice: "Matthew" },
  { id: "clyde", name: "Clyde", gender: "Male", accent: "American",   pitch: 0.7,  rate: 1.15, ttsLang: "en",     ttsVoice: "Joey"    },
  { id: "paul",  name: "Paul",  gender: "Male", accent: "Australian",  pitch: 1.0,  rate: 1.30, ttsLang: "en-au",  ttsVoice: "Russell" },
  { id: "dave",  name: "Dave",  gender: "Male", accent: "British",    pitch: 0.95, rate: 1.28, ttsLang: "en-gb",  ttsVoice: "Brian"   },
  { id: "adam",  name: "Adam",  gender: "Male", accent: "Indian",     pitch: 0.8,  rate: 1.22, ttsLang: "en-in",  ttsVoice: "Justin"  },
];

// ── Main Page ────────────────────────────────────────────────────────
export default function PublicConsultPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = use(params);

  // Core state
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
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [voiceDropdownOpen, setVoiceDropdownOpen] = useState(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

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
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [streamedMsgId, setStreamedMsgId] = useState<string | null>(null);
  const [streamedCount, setStreamedCount] = useState(0);
  const [orbSize, setOrbSize] = useState(90);

  // Refs
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
  // Shared mic stream — reused by session recorder + voice recognition so
  // stopping SpeechRecognition never kills the recorder's audio source
  const micStreamRef = useRef<MediaStream | null>(null);
  // AudioContext mixing — combines mic + TTS audio into one recording
  const mixedDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const ttsSourceRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  // Track latest isRecording in a ref so async callbacks avoid stale closures
  const isRecordingRef = useRef(false);
  // voiceAutoMode: true once user manually clicks mic → enables auto-cycle (AI speaks → auto-start mic)
  // Reset to false when user manually stops mic
  const voiceAutoModeRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSendVoiceRef = useRef<((text: string) => void) | null>(null);
  const voiceDropdownRef = useRef<HTMLDivElement>(null);
  // Queue of user text messages to be silently TTS'd into the recording
  const textRecordQueueRef = useRef<string[]>([]);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamContentRef = useRef<string>("");
  const textRecordBusyRef = useRef(false);

  // ── Fetch agent ──────────────────────────────────────────────────
  const fetchAgent = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/agents/${publicId}`);
      if (!res.ok) throw new Error("Not found");
      setAgent(await res.json());
    } catch { setPageError("This assistant is not available."); }
    finally { setIsLoading(false); }
  }, [publicId]);

  // ── Effects ──────────────────────────────────────────────────────
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
      console.error("Speech error:", e.error);
      setIsRecording(false);
    };
    rec.onend = () => { if (isRecordingRef.current) { try { rec.start(); } catch { /* */ } } };
    recognitionRef.current = rec;
    return () => { try { rec.abort(); } catch { /* */ } };
  }, [agent?.language]);

  useEffect(() => { fetchAgent(); }, [fetchAgent]);
  // Initialize selected voice from agent's voiceId once loaded
  useEffect(() => {
    if (agent?.voiceId && !selectedVoiceId) setSelectedVoiceId(agent.voiceId);
  }, [agent?.voiceId, selectedVoiceId]);
  useEffect(() => { convIdRef.current = conversationId; }, [conversationId]);

  // Look up the active voice preset (selected by user or default from agent config)
  const activeVoice = voicePresets.find(v => v.id === selectedVoiceId) ?? voicePresets[0];
  // Auto-scroll to bottom on every new message
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);
  useEffect(() => { if (chatError) { const t = setTimeout(() => setChatError(""), 5000); return () => clearTimeout(t); } }, [chatError]);

  // Responsive orb size: 90 on mobile, 150 on desktop (md = 768px)
  useEffect(() => {
    const update = () => setOrbSize(window.innerWidth >= 768 ? 150 : 90);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Character-by-character streaming synced to TTS audio playback.
  // Polls for the audio element, then uses RAF to reveal text proportionally
  // to audio.currentTime / audio.duration. Falls back to fixed rate when
  // TTS is off or audio never starts within 2 s.
  useEffect(() => {
    if (!streamedMsgId) return;
    const total = streamContentRef.current.length;
    if (total === 0) { setStreamedMsgId(null); return; }

    let rafId: number;
    let cleanedUp = false;

    const fixedRate = () => {
      const msPerChar = Math.max(15, Math.round(5000 / total));
      let count = 0;
      streamIntervalRef.current = setInterval(() => {
        if (cleanedUp) { clearInterval(streamIntervalRef.current!); return; }
        count++;
        setStreamedCount(count);
        if (count >= total) { clearInterval(streamIntervalRef.current!); setStreamedMsgId(null); }
      }, msPerChar);
    };

    const syncToAudio = (audio: HTMLAudioElement) => {
      if (cleanedUp) return;
      const dur = audio.duration;
      if (!dur || !isFinite(dur)) {
        rafId = requestAnimationFrame(() => syncToAudio(audio));
        return;
      }
      const progress = Math.min(audio.currentTime / dur, 1);
      const newCount = Math.min(Math.round(progress * total), total);
      setStreamedCount(newCount);
      if (audio.ended || newCount >= total) {
        setStreamedCount(total);
        setStreamedMsgId(null);
        return;
      }
      rafId = requestAnimationFrame(() => syncToAudio(audio));
    };

    let pollAttempts = 0;
    const pollIv = setInterval(() => {
      if (cleanedUp) { clearInterval(pollIv); return; }
      const audio = ttsSourceRef.current;
      if (audio) {
        clearInterval(pollIv);
        syncToAudio(audio);
      } else if (++pollAttempts > 40) {
        clearInterval(pollIv);
        fixedRate();
      }
    }, 50);

    return () => {
      cleanedUp = true;
      clearInterval(pollIv);
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      cancelAnimationFrame(rafId);
    };
  }, [streamedMsgId]);

  // Scroll-to-bottom button visibility
  useEffect(() => {
    if (!started) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 150);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [started]);

  // Close voice dropdown when clicking outside
  useEffect(() => {
    if (!voiceDropdownOpen) return;
    const onClick = (e: MouseEvent) => {
      if (voiceDropdownRef.current && !voiceDropdownRef.current.contains(e.target as Node)) {
        setVoiceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [voiceDropdownOpen]);

  // No auto-send — user clicks Send button or mic toggle when done speaking

  // Voice state
  useEffect(() => {
    if (isSpeaking) setVoiceState("speaking");
    else if (isSending) setVoiceState("thinking");
    else if (isRecording) setVoiceState("listening");
    else setVoiceState("idle");
  }, [isRecording, isSending, isSpeaking]);

  // Keep ref in sync so async callbacks always see the latest value
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  // Call timer — runs continuously from call start to call end
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

  // ── Auto-save recording ──────────────────────────────────────────
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

  // Save recording if user closes/navigates away without clicking End Call
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") saveCurrentRecording(); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [saveCurrentRecording]);

  // ── Start conversation ───────────────────────────────────────────
  const beginConversation = async () => {
    if (!agent) return;
    // Stop any voice preview playing on the start screen
    if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current = null; }
    window.speechSynthesis?.cancel();
    setPreviewingVoiceId(null);
    setVoiceDropdownOpen(false);
    try {
      const res = await fetch(`/api/agents/${agent.id}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: agent.voiceEnabled ? "voice" : "text", source: "widget" }),
      });
      if (!res.ok) throw new Error("Failed to start");
      const conv = await res.json();
      setConversationId(conv.id);
      setStarted(true);

      // Start session-level recording that captures BOTH mic + TTS audio.
      // We create a shared AudioContext with a MediaStreamDestination that mixes
      // the mic input and TTS playback into one stream for the MediaRecorder.
      try {
        const recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = recStream;
        sessionChunksRef.current = [];

        // Create shared AudioContext for mixing mic + TTS into one recording
        // Use the browser's native sample rate — forcing 48kHz on a 44.1kHz system
        // causes the OS to resample the output and creates robotic/metallic artifacts.
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        const mixedDest = ctx.createMediaStreamDestination();
        mixedDestRef.current = mixedDest;

        // Connect mic to the mixed destination (so mic audio is recorded)
        const micSrc = ctx.createMediaStreamSource(recStream);
        micSourceRef.current = micSrc;
        micSrc.connect(mixedDest);

        // Record from the mixed stream (captures both mic + TTS audio)
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
        const recorder = new MediaRecorder(mixedDest.stream, mimeType ? { 
          mimeType,
          audioBitsPerSecond: 128000  // High quality audio recording
        } : { audioBitsPerSecond: 128000 });
        recorder.ondataavailable = (e) => { if (e.data.size > 0) sessionChunksRef.current.push(e.data); };
        recorder.start(1000);
        sessionRecorderRef.current = recorder;
      } catch { /* mic permission denied or not available — skip recording */ }

      const msgRes = await fetch(`/api/conversations/${conv.id}/messages`);
      if (msgRes.ok) {
        const msgs = await msgRes.json();
        setMessages(msgs);
        if (msgs.length > 0) {
          streamContentRef.current = msgs[0].content;
          setStreamedMsgId(msgs[0].id);
          setStreamedCount(0);
          if (audioEnabled && agent.voiceEnabled) {
            speakMessage(msgs[0].content);
          }
          // Auto-mic only starts if user has manually clicked mic (voiceAutoModeRef)
        }
        // No auto-start listening on load — user must click mic manually first
      }
    } catch (err) {
      console.error("Start error:", err);
      setChatError("Failed to start conversation.");
    }
  };

  // ── Audio ────────────────────────────────────────────────────────
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
      // Reuse the shared mic stream if the tracks are still alive; otherwise request a new one.
      let stream = micStreamRef.current;
      if (!stream || stream.getTracks().some(t => t.readyState === "ended")) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
      }
      mediaStreamRef.current = stream;

      // Reuse the shared AudioContext (created in beginConversation)
      const ctx = audioContextRef.current;
      if (ctx) {
        if (ctx.state === "suspended") await ctx.resume();
        // Reconnect mic to recording — it's the user's turn to speak
        if (micSourceRef.current && mixedDestRef.current) {
          try { micSourceRef.current.connect(mixedDestRef.current); } catch { /* */ }
        }
        // Clean up previous analyser connection before creating a new one
        if (analyserRef.current && micSourceRef.current) {
          try { micSourceRef.current.disconnect(analyserRef.current); } catch { /* */ }
        }
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.8;
        // Connect mic source to analyser for audio level visualization
        if (micSourceRef.current) {
          micSourceRef.current.connect(analyser);
        }
        analyserRef.current = analyser;
        updateAudioLevel();
      }

      // Abort any lingering recognition before starting fresh
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
    // Set ref immediately so onend doesn't restart recognition
    isRecordingRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* */ }
    // Don't stop mic tracks here — the session recorder shares this stream.
    // Tracks are only stopped in endCall() when the call is fully over.
    mediaStreamRef.current = null;
    if (audioLevelFrameRef.current) cancelAnimationFrame(audioLevelFrameRef.current);
    // Don't disconnect mic from analyser here — that risks disrupting the
    // mic→mixedDest recording connection. Old analysers are cleaned up in startListening.
    analyserRef.current = null;
    setIsRecording(false); setAudioLevel(0);
  }, []);


  const speakMessage = async (text: string) => {
    if (!audioEnabled || typeof window === "undefined") return;

    // Cancel any in-flight TTS fetch or playback
    ttsAbortRef.current?.abort();
    if (ttsSourceRef.current) { ttsSourceRef.current.pause(); ttsSourceRef.current = null; }

    // Mute mic in recording during AI speech — only TTS goes into the recording.
    // Also stop ASR so it doesn't transcribe the speaker output as user input.
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
      // Auto-start listening only if user previously clicked mic (voiceAutoMode)
      if (agent?.voiceEnabled && voiceAutoModeRef.current && !isRecordingRef.current) setTimeout(() => startListening(), 300);
    };

    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}&lang=${ttsLang}`, { signal: controller.signal });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Use <Audio> element for clean browser-native playback (avoids AudioBufferSourceNode
      // back-pressure that makes voice sound robotic when routed through AudioContext).
      const audio = new Audio(url);
      audio.playbackRate = rate;

      if (ctx && mixedDest) {
        // Route through AudioContext so TTS is captured in the mixed recording.
        // createMediaElementSource uses the browser's media pipeline for playback
        // quality while still feeding the AudioContext graph for the recorder.
        if (ctx.state === "suspended") await ctx.resume();
        const mediaSource = ctx.createMediaElementSource(audio);
        mediaSource.connect(ctx.destination);  // live playback
        mediaSource.connect(mixedDest);         // captured in recording
        // Tap TTS into analyser so orb reacts to AI voice amplitude in real-time
        const ttsAnalyser = ctx.createAnalyser();
        ttsAnalyser.fftSize = 256; ttsAnalyser.smoothingTimeConstant = 0.5;
        mediaSource.connect(ttsAnalyser);
        analyserRef.current = ttsAnalyser;
        cancelAnimationFrame(audioLevelFrameRef.current);
        updateAudioLevel();
      }

      ttsSourceRef.current = audio;
      setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false); setAudioLevel(0);
        cancelAnimationFrame(audioLevelFrameRef.current);
        analyserRef.current = null;
        URL.revokeObjectURL(url);
        ttsSourceRef.current = null;
        reconnectMic();
      };
      audio.onerror = () => {
        setIsSpeaking(false); setAudioLevel(0);
        cancelAnimationFrame(audioLevelFrameRef.current);
        analyserRef.current = null;
        URL.revokeObjectURL(url);
        ttsSourceRef.current = null;
        reconnectMic();
      };
      audio.play().catch(() => { setIsSpeaking(false); URL.revokeObjectURL(url); ttsSourceRef.current = null; reconnectMic(); });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setIsSpeaking(false);
      reconnectMic();
    }
  };

  // ── Send message ─────────────────────────────────────────────────
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
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Failed to send"); }

      const { userMessage, assistantMessage } = await res.json();
      setMessages(prev => {
        const updated = [...prev.filter(m => m.id !== tempId), userMessage];
        if (assistantMessage) updated.push(assistantMessage);
        return updated;
      });
      // Side effects OUTSIDE the state updater so React properly commits
      // messages before voiceState transitions to "speaking"
      if (assistantMessage) {
        streamContentRef.current = assistantMessage.content;
        setStreamedMsgId(assistantMessage.id);
        setStreamedCount(0);
        // Wait for any queued user text TTS to finish recording before agent speaks
        if (textRecordBusyRef.current) {
          await new Promise<void>(resolve => {
            const check = () => { if (!textRecordBusyRef.current) resolve(); else setTimeout(check, 100); };
            check();
          });
        }
        if (audioEnabled) speakMessage(assistantMessage.content);
        setTimeout(() => saveCurrentRecording(), 1200);
      }
    } catch (err) {
      console.error("Send error:", err);
      setChatError("Failed to send. Please try again.");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally { setIsSending(false); }
  };

  // Silently play user text as TTS into the recording (not audible live)
  // Sequential: waits for agent speech + previous items before recording each
  const processTextRecordQueue = async () => {
    if (textRecordBusyRef.current) return;
    textRecordBusyRef.current = true;
    while (textRecordQueueRef.current.length > 0) {
      const text = textRecordQueueRef.current.shift()!;
      // Wait for any ongoing agent speech to finish first
      if (ttsSourceRef.current) {
        await new Promise<void>(resolve => {
          const check = () => { if (!ttsSourceRef.current) resolve(); else setTimeout(check, 100); };
          check();
        });
      }
      const ctx = audioContextRef.current;
      const mixedDest = mixedDestRef.current;
      if (!ctx || !mixedDest) continue;
      try {
        const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}&lang=en`);
        if (!res.ok) continue;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        if (ctx.state === "suspended") await ctx.resume();
        const src = ctx.createMediaElementSource(audio);
        // Silent gain — captured in recording but not heard live
        const silentGain = ctx.createGain();
        silentGain.gain.value = 0;
        src.connect(silentGain);
        silentGain.connect(ctx.destination);
        src.connect(mixedDest);
        await new Promise<void>(resolve => {
          audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
          audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
          audio.play().catch(() => { URL.revokeObjectURL(url); resolve(); });
        });
      } catch { /* ignore */ }
    }
    textRecordBusyRef.current = false;
  };

  const handleSendText = () => {
    if (!input.trim()) return;
    // If user types and sends while voice is active, stop listening first
    if (isRecording) {
      setTranscript(""); setInterimTranscript("");
      stopListening();
    }
    const text = input; setInput("");
    // Queue text for silent TTS capture into recording (sequential, not live)
    textRecordQueueRef.current.push(text);
    processTextRecordQueue();
    sendMessage(text, false);
  };

  // Stop listening and send the transcribed text as a voice message
  const autoSendVoice = (text: string) => {
    setTranscript(""); setInterimTranscript("");
    isRecordingRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* */ }
    if (audioLevelFrameRef.current) cancelAnimationFrame(audioLevelFrameRef.current);
    mediaStreamRef.current = null;
    // Disconnect mic from recording — user's turn is over.
    // Mic will be reconnected in startListening when it's user's turn again.
    if (micSourceRef.current && mixedDestRef.current) {
      try { micSourceRef.current.disconnect(mixedDestRef.current); } catch { /* */ }
    }
    analyserRef.current = null;
    setIsRecording(false); setAudioLevel(0);
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    sendMessage(text, true);
  };
  autoSendVoiceRef.current = autoSendVoice;

  const endCall = () => {
    // Cancel any in-flight TTS
    ttsAbortRef.current?.abort();
    if (ttsSourceRef.current) { ttsSourceRef.current.pause(); ttsSourceRef.current = null; }

    // Tell the server the conversation has ended — triggers analysis generation
    if (conversationId) {
      fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ended", duration: callDuration }),
      }).catch(() => {});
    }

    // Final save with all chunks collected so far
    saveCurrentRecording();
    // Stop session recorder and upload the audio
    const recorder = sessionRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      const convId = conversationId;
      recorder.onstop = () => {
        // Stop all mic tracks now that the call is truly over
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
    // Close the shared AudioContext now that the call is fully over
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

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {});
  };

const previewVoice = async (voiceId: string) => {
    if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current = null; }
    if (previewingVoiceId === voiceId) { setPreviewingVoiceId(null); return; }
    const preset = voicePresets.find(v => v.id === voiceId);
    if (!preset) return;
    setPreviewingVoiceId(voiceId);
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent("Hi there, this is how I sound. How can I help you today?")}&lang=${preset.ttsLang}`);
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = preset.rate;
      previewAudioRef.current = audio;
      audio.onended = () => { setPreviewingVoiceId(null); URL.revokeObjectURL(url); previewAudioRef.current = null; };
      audio.onerror = () => { setPreviewingVoiceId(null); URL.revokeObjectURL(url); previewAudioRef.current = null; };
      audio.play();
    } catch { setPreviewingVoiceId(null); }
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────
  if (pageError || !agent) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Not Available</h2>
        <p className="text-sm text-gray-500">{pageError || "This assistant is not available."}</p>
      </div>
    </div>
  );

  // ── Start Screen ──────────────────────────────────────────────────
  const canUseVoice = agent.voiceEnabled && speechSupported;
  if (!started) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center max-w-sm w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        {/* Avatar */}
        <div className="h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center text-lg font-bold text-white mb-5">
          {initials}
        </div>

        <h1 className="text-xl font-semibold text-gray-900 text-center">{agent.name}</h1>
        {agent.description && (
          <p className="text-sm text-gray-500 mt-2 text-center leading-relaxed">{agent.description}</p>
        )}

        {/* Capabilities row */}
        <div className="flex items-center gap-2 mt-5">
          <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
            <Volume2 className="h-3 w-3" /> Voice + Text
          </span>
          {canUseVoice && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
              <Mic className="h-3 w-3" /> Mic support
            </span>
          )}
        </div>

        {/* Voice picker — select AI voice accent */}
        {canUseVoice && (
          <div className="mt-5 w-full relative" ref={voiceDropdownRef}>
            <p className="text-xs text-gray-400 mb-1.5">AI Voice</p>
            <button
              onClick={() => setVoiceDropdownOpen(!voiceDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Volume2 className="h-3 w-3 text-gray-500" />
                </div>
                <span className="text-gray-800 font-medium text-sm">{activeVoice.name}</span>
                <span className="text-gray-400 text-xs">{activeVoice.gender} · {activeVoice.accent}</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform duration-200", voiceDropdownOpen && "rotate-180")} />
            </button>

            {voiceDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-gray-200 bg-white shadow-xl z-50 overflow-hidden max-h-52 overflow-y-auto">
                {voicePresets.map((v) => (
                  <div
                    key={v.id}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors",
                      selectedVoiceId === v.id ? "bg-gray-50" : "hover:bg-gray-50"
                    )}
                  >
                    <button
                      className="flex-1 flex items-center gap-2 text-left"
                      onClick={() => { setSelectedVoiceId(v.id); setVoiceDropdownOpen(false); }}
                    >
                      <span className={cn("text-sm font-medium", selectedVoiceId === v.id ? "text-gray-900" : "text-gray-700")}>{v.name}</span>
                      <span className="text-xs text-gray-400">{v.gender} · {v.accent}</span>
                      {selectedVoiceId === v.id && <span className="ml-auto text-xs text-gray-900 font-medium">✓</span>}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); previewVoice(v.id); }}
                      title="Preview voice"
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition ml-2",
                        previewingVoiceId === v.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                    >
                      {previewingVoiceId === v.id ? <Square className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Begin button */}
        <button
          onClick={beginConversation}
          className="mt-5 w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 active:scale-[0.98] transition-all text-sm"
        >
          Start Conversation
        </button>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Type or click the mic icon to speak during conversation
        </p>

        {agent.voiceEnabled && !speechSupported && (
          <p className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-center w-full">
            Voice input requires Chrome, Edge, or Safari
          </p>
        )}

        {chatError && <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg text-center w-full">{chatError}</p>}
      </div>

      <p className="mt-5 text-xs text-gray-400">
        Powered by <span className="font-medium text-gray-500">X-Health AI</span>
      </p>
    </div>
  );

  // ── Conversation View ────────────────────────────────────────────
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
            <p className="text-xs text-gray-500">
              {callEnded
                ? `Call ended · ${fmtTime(callDuration)}`
                : <span className={cn(
                    "inline-flex items-center gap-1",
                    voiceState === "listening" && "text-emerald-600",
                    voiceState === "speaking" && "text-indigo-600",
                    voiceState === "thinking" && "text-amber-600",
                  )}>
                    {voiceState === "listening" && "● Listening"}
                    {voiceState === "thinking" && "● Thinking"}
                    {voiceState === "speaking" && "● Speaking"}
                    {voiceState === "idle" && "● Connected"}
                    {callDuration > 0 && <span className="text-gray-400 ml-1">· {fmtTime(callDuration)}</span>}
                  </span>
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            title={audioEnabled ? "Mute audio" : "Enable audio"}
          >
            {audioEnabled ? <Volume2 className={cn("h-4 w-4", isSpeaking ? "text-gray-900" : "text-gray-500")} /> : <VolumeX className="h-4 w-4 text-gray-400" />}
          </button>
          {!callEnded && (
            <button
              onClick={endCall}
              className="h-8 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1.5 transition text-xs font-medium"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              End
            </button>
          )}
        </div>
      </header>

      {/*
        Mobile:  flex-col  →  Messages 65%  |  Orb strip 35%  |  Input bar
        Desktop: CSS grid  →  Orb col-1 full-height  |  Messages col-2 row-1  /  Input col-2 row-2
      */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col md:grid md:grid-cols-[35%_65%] md:grid-rows-[1fr_auto]">

        {/* ── 1. Messages ── top 65% on mobile | right col / top row on desktop ── */}
        <div className="flex-[65] min-h-0 overflow-y-auto md:col-start-2 md:row-start-1" ref={scrollRef}>
          <div className="space-y-3 px-4 py-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2 group/msg items-end", msg.role === "user" ? "flex-row-reverse" : "")}>
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold",
                  msg.role === "assistant" ? "bg-gray-100 text-gray-600" : "bg-gray-900 text-white"
                )}>
                  {msg.role === "assistant" ? initials[0] : "U"}
                </div>
                <div className={cn(
                  "max-w-[78%] rounded-2xl px-3 py-2.5",
                  msg.role === "assistant"
                    ? "bg-gray-50 border border-gray-200 text-gray-900"
                    : "bg-gray-900 text-white"
                )}>
                  {msg.isVoiceInput && (
                    <span className={cn("text-xs flex items-center gap-1 mb-1", msg.role === "user" ? "text-gray-400 justify-end" : "text-gray-400")}>
                      <Mic className="h-3 w-3" /> Voice
                    </span>
                  )}
                  <p className="text-sm leading-relaxed">
                    {msg.id === streamedMsgId
                      ? streamContentRef.current.slice(0, streamedCount)
                      : msg.content}
                  </p>
                  <div className={cn("flex items-center gap-2 mt-1", msg.role === "user" ? "justify-end" : "")}>
                    <span className={cn("text-xs", msg.role === "assistant" ? "text-gray-400" : "text-gray-500")}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      title="Copy message"
                      className="opacity-0 group-hover/msg:opacity-100 transition-opacity"
                    >
                      {copiedId === msg.id
                        ? <CheckCheck className="h-3 w-3 text-emerald-500" />
                        : <Copy className={cn("h-3 w-3", msg.role === "assistant" ? "text-gray-400 hover:text-gray-600" : "text-gray-500 hover:text-gray-300")} />
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-2 items-end">
                <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-semibold shrink-0">{initials[0]}</div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
            {messages.length === 0 && !isSending && (
              <div className="flex items-center justify-center h-24">
                <p className="text-sm text-gray-400">Starting conversation...</p>
              </div>
            )}
          </div>

          {/* Scroll-to-bottom FAB */}
          {showScrollBtn && (
            <div className="sticky bottom-4 flex justify-center z-20 pointer-events-none">
              <button
                onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })}
                className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-full shadow-lg hover:bg-gray-800 transition"
              >
                <ChevronsDown className="h-3.5 w-3.5" />
                Scroll to latest
              </button>
            </div>
          )}
        </div>

        {/* ── 2. Orb strip ── middle 35% on mobile | left col full-height on desktop ── */}
        <div className="flex-[35] md:col-start-1 md:row-start-1 md:row-span-2 flex flex-col items-center justify-center bg-white md:border-r border-gray-100 overflow-visible relative">
          {callEnded ? (
            <div className="flex flex-col items-center text-center px-6">
              <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
                <PhoneOff className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Call Ended</p>
              <p className="text-xs text-gray-500 mt-1">{messages.length} messages · {fmtTime(callDuration)}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-7 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
              >
                New Chat
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full px-4 py-3 gap-4">
              <AIOrb
                state={isSpeaking ? "speaking" : isRecording ? "listening" : "idle"}
                size={orbSize}
                audioLevel={audioLevel}
              />
              {/* Text/button zone — fixed height so orb never shifts when Send button appears */}
              <div className="flex flex-col items-center gap-2 w-full max-w-[240px] h-[64px] md:h-[88px] overflow-hidden">
                {isRecording && (transcript || interimTranscript) ? (
                  <>
                    <p className={cn(
                      "text-base md:text-xl text-gray-700 leading-snug text-center line-clamp-2 md:line-clamp-3",
                      transcript.trim() && "md:font-semibold"
                    )}>
                      {transcript}<span className="text-gray-400">{interimTranscript}</span>
                    </p>
                    {transcript.trim() && (
                      <button
                        onClick={() => autoSendVoice(transcript.trim())}
                        className="px-5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-full hover:bg-gray-800 transition"
                      >
                        Send
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-xs md:text-sm md:font-semibold md:text-gray-600 text-gray-400 text-center">
                    {voiceState === "speaking" ? "Speaking…" : voiceState === "thinking" ? "Thinking…" : voiceState === "listening" ? "Listening…" : ""}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Input bar ── bottom on mobile | right col / bottom row on desktop ── */}
        {!callEnded && (
          <div className="shrink-0 md:col-start-2 md:row-start-2 bg-white">
            {chatError && (
              <div className="mx-3 mb-1.5 px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg text-center border border-red-200">{chatError}</div>
            )}
            <div className="border-t border-gray-100 px-3 py-2.5">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendText(); }}
                className="flex items-center gap-1.5"
              >
                {canUseVoice && (
                  <div className="relative shrink-0 flex items-center justify-center">
                    {isRecording && (
                      <span
                        className="absolute rounded-full bg-red-400/20 transition-transform duration-75 pointer-events-none"
                        style={{ inset: "-4px", transform: `scale(${1 + audioLevel * 0.6})` }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (isRecording) {
                          voiceAutoModeRef.current = false;
                          const txt = transcript.trim();
                          if (txt) { autoSendVoice(txt); } else { stopListening(); }
                        } else {
                          if (isSpeaking) {
                            ttsAbortRef.current?.abort();
                            if (ttsSourceRef.current) { ttsSourceRef.current.pause(); ttsSourceRef.current = null; }
                            setIsSpeaking(false);
                          }
                          voiceAutoModeRef.current = true;
                          setTranscript(""); setInterimTranscript("");
                          startListening();
                        }
                      }}
                      className={cn(
                        "relative h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200",
                        isRecording
                          ? "bg-red-500 text-white scale-110 shadow-sm shadow-red-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  </div>
                )}
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isSpeaking ? "Agent is speaking…" : isRecording ? "Tap mic to send" : "Type a message…"}
                  disabled={isSending}
                  className="flex-1 h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-gray-300"
                />
                <button
                  type={isRecording && transcript.trim() ? "button" : "submit"}
                  onClick={isRecording && transcript.trim() ? () => autoSendVoice(transcript.trim()) : undefined}
                  disabled={(!input.trim() && !(isRecording && transcript.trim())) || isSending}
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                    (input.trim() || (isRecording && transcript.trim())) && !isSending
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-gray-100 text-gray-300"
                  )}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
