"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare, Mic, Phone, Clock, User, Search, Filter,
  Loader2, ExternalLink, Calendar, PhoneOff, Globe, Hash,
  ChevronRight, Play, Square, CheckCircle2, XCircle, Database,
  FileText, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { IntelligencePortrait } from "@/components/agent/intelligence-portrait";
import type { ConversationIntelligence } from "@/lib/store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  audioDuration?: number;
  isVoiceInput?: boolean;
  createdAt: string;
}

interface EvalSummary {
  total: number;
  passed: number;
  passRate: number;
}

interface Conversation {
  id: string;
  mode: string;
  status: string;
  duration: number | null;
  audioUrl?: string | null;
  callerName: string | null;
  callerEmail: string | null;
  callerPhone: string | null;
  summary: string | null;
  sentiment: string | null;
  source: string;
  createdAt: string;
  endedAt: string | null;
  messages: Message[];
  agent?: { id: string; name: string; voiceId?: string | null };
  messageCount: number;
  evaluation: EvalSummary | null;
  intelligence: ConversationIntelligence | null;
}

interface EvaluationResult {
  id: string;
  criterionName: string;
  type: string;
  result: boolean | null;
  score: number | null;
  analysis: string;
}

interface CollectedDataItem {
  id: string;
  dataPointName: string;
  dataType: string;
  value: string;
}

interface Agent {
  id: string;
  name: string;
  voiceId?: string | null;
}

function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const durationFixedRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    durationFixedRef.current = false;
    setPlaying(false); setCurrentTime(0); setDuration(0);

    const onMeta = () => {
      if (!isFinite(audio.duration) || isNaN(audio.duration)) {
        // WebM MediaRecorder files often have no duration in metadata.
        // Seeking to a huge value forces the browser to scan the file and compute real duration.
        audio.currentTime = 1e10;
      } else {
        setDuration(audio.duration);
      }
    };
    const onSeeked = () => {
      if (!durationFixedRef.current && (!isFinite(duration) || duration === 0)) {
        durationFixedRef.current = true;
        setDuration(audio.duration);
        audio.currentTime = 0;
      }
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => { if (isFinite(audio.duration)) setDuration(audio.duration); };
    const onEnded = () => { setPlaying(false); setCurrentTime(0); };

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("seeked", onSeeked);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("seeked", onSeeked);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    playing ? audio.pause() : audio.play();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(duration, ((e.clientX - rect.left) / rect.width) * duration));
  };

  const fmt = (s: number) => {
    if (!s || !isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <button
        onClick={toggle}
        className="h-7 w-7 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 hover:bg-gray-700 transition"
      >
        {playing ? <Square className="h-2.5 w-2.5 fill-current" /> : <Play className="h-2.5 w-2.5 fill-current ml-0.5" />}
      </button>
      <div
        className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer relative"
        onClick={seek}
      >
        <div className="h-full bg-gray-700 rounded-full transition-none" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-[11px] text-gray-500 tabular-nums shrink-0">
        {fmt(currentTime)} / {fmt(duration)}
      </span>
    </div>
  );
}

const sentimentColor = (s: string | null) => {
  if (s === "positive") return "bg-emerald-100 text-emerald-700";
  if (s === "negative") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
};

const sourceLabel = (source: string) => {
  if (source === "widget") return "Public URL";
  if (source === "dashboard") return "Dashboard";
  if (source === "api") return "API";
  return source;
};

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAgent, setFilterAgent] = useState(() => searchParams.get("agentId") ?? "all");
  const [filterMode, setFilterMode] = useState("all");

  // Analysis data for selected conversation
  const [evalResults, setEvalResults] = useState<EvaluationResult[]>([]);
  const [collectedData, setCollectedData] = useState<CollectedDataItem[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // TTS playback
  const [playingConvId, setPlayingConvId] = useState<string | null>(null);
  const [playingMsgIndex, setPlayingMsgIndex] = useState<number>(-1);
  const [playbackElapsed, setPlaybackElapsed] = useState(0);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { fetchData(); }, []);

  // Fetch analysis when conversation is selected
  useEffect(() => {
    if (!selected) return;
    setLoadingAnalysis(true);
    fetch(`/api/conversations/${selected.id}/analysis`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setEvalResults(data.evaluationResults || []);
          setCollectedData(data.collectedData || []);
        } else {
          setEvalResults([]);
          setCollectedData([]);
        }
      })
      .catch(() => { setEvalResults([]); setCollectedData([]); })
      .finally(() => setLoadingAnalysis(false));
  }, [selected?.id]);

  const fetchData = async () => {
    try {
      const agentsRes = await fetch("/api/agents", { credentials: "include" });
      if (!agentsRes.ok) return;
      const agentsData: Agent[] = await agentsRes.json();
      setAgents(agentsData);

      const all: Conversation[] = [];
      await Promise.all(
        agentsData.map(async (agent) => {
          const res = await fetch(`/api/agents/${agent.id}/conversations`, { credentials: "include" });
          if (res.ok) {
            const { conversations: convs } = await res.json();
            all.push(...convs.map((c: Conversation) => ({ ...c, agent: { id: agent.id, name: agent.name, voiceId: agent.voiceId } })));
          }
        })
      );
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setConversations(all);
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.callerName?.toLowerCase().includes(q) ||
      c.callerEmail?.toLowerCase().includes(q) ||
      c.messages.some(m => m.content.toLowerCase().includes(q));
    return matchSearch &&
      (filterAgent === "all" || c.agent?.id === filterAgent) &&
      (filterMode === "all" || c.mode === filterMode);
  });

  const fmtDuration = (s: number | null) => {
    if (!s) return "--";
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const fmtDate = (d: string) => {
    const date = new Date(d), now = new Date();
    const diff = (now.getTime() - date.getTime()) / 3600000;
    if (diff < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 48) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const fmtFullDate = (d: string) =>
    new Date(d).toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const getCallDuration = (conv: Conversation) => {
    if (conv.duration) return conv.duration;
    if (conv.messages.length < 2) return null;
    const first = new Date(conv.messages[0].createdAt).getTime();
    const last = new Date(conv.messages[conv.messages.length - 1].createdAt).getTime();
    return Math.round((last - first) / 1000);
  };

  const totalDuration = conversations.reduce((sum, c) => sum + (c.duration || 0), 0);
  const avgDuration = conversations.length ? Math.round(totalDuration / conversations.length) : 0;

  function stopPlayback() {
    window.speechSynthesis.cancel();
    if (playbackTimerRef.current) { clearInterval(playbackTimerRef.current); playbackTimerRef.current = null; }
    setPlayingConvId(null);
    setPlayingMsgIndex(-1);
    setPlaybackElapsed(0);
  }

  function estimateDuration(text: string) {
    return Math.max(0.8, text.split(/\s+/).filter(Boolean).length / 2.5);
  }

  function getTimestamps(messages: Message[]) {
    let t = 0;
    return messages.map(msg => { const s = t; t += estimateDuration(msg.content) + 0.25; return s; });
  }

  const FEMALE_VOICE_IDS = new Set(["rachel","sarah","domi","jessica","bella","charlotte","alice","lily"]);

  function pickVoice(voices: SpeechSynthesisVoice[], gender: "male" | "female"): SpeechSynthesisVoice | null {
    const en = voices.filter(v => v.lang.startsWith("en"));
    if (en.length === 0) return voices[0] ?? null;
    if (gender === "female") {
      return en.find(v => /samantha|karen|victoria|zira|hazel|alice|moira|fiona|female/i.test(v.name)) ?? en[0];
    } else {
      return en.find(v => /daniel|alex|david|george|fred|rishi|mark|aaron|male/i.test(v.name)) ?? en[Math.min(1, en.length - 1)];
    }
  }

  function playConversation(conv: Conversation) {
    if (playingConvId === conv.id) { stopPlayback(); return; }
    window.speechSynthesis.cancel();
    if (playbackTimerRef.current) { clearInterval(playbackTimerRef.current); playbackTimerRef.current = null; }

    const messages = [...conv.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (messages.length === 0) return;

    const agentVoiceId = conv.agent?.voiceId ?? null;
    const aiGender: "male" | "female" = agentVoiceId && FEMALE_VOICE_IDS.has(agentVoiceId) ? "female" : "male";
    const userGender: "male" | "female" = aiGender === "female" ? "male" : "female";

    setPlayingConvId(conv.id);
    setPlayingMsgIndex(0);
    setPlaybackElapsed(0);

    setTimeout(() => {
      playbackTimerRef.current = setInterval(() => {
        setPlaybackElapsed(prev => prev + 0.1);
      }, 100);

      function speakNext(index: number) {
        if (index >= messages.length) {
          if (playbackTimerRef.current) { clearInterval(playbackTimerRef.current); playbackTimerRef.current = null; }
          setPlayingConvId(null);
          setPlayingMsgIndex(-1);
          return;
        }
        setPlayingMsgIndex(index);
        const msg = messages[index];
        const utt = new SpeechSynthesisUtterance(msg.content);
        utt.lang = "en-US";
        utt.rate = msg.role === "assistant" ? 1.0 : 1.05;
        utt.pitch = msg.role === "assistant" ? (aiGender === "female" ? 1.1 : 0.9) : (userGender === "female" ? 1.2 : 0.85);

        function go() {
          const voices = window.speechSynthesis.getVoices();
          const gender = msg.role === "assistant" ? aiGender : userGender;
          const picked = pickVoice(voices, gender);
          if (picked) utt.voice = picked;
          utt.onend = () => speakNext(index + 1);
          utt.onerror = () => speakNext(index + 1);
          window.speechSynthesis.speak(utt);
        }

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) go();
        else { window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; go(); }; }
      }

      speakNext(0);
    }, 100);
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conversation history</h1>
        <p className="text-sm text-gray-500 mt-0.5">All conversations across your agents</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-gray-50 border-gray-200 h-9" />
          </div>
          <Select value={filterAgent} onValueChange={setFilterAgent}>
            <SelectTrigger className="w-[160px] h-9 bg-white border-gray-200">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterMode} onValueChange={setFilterMode}>
            <SelectTrigger className="w-[130px] h-9 bg-white border-gray-200"><SelectValue placeholder="Mode" /></SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="text">Text</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Conversation list */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
            <span className="text-xs text-gray-400">{filtered.length} results</span>
          </div>
          <ScrollArea className="h-[700px]">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-10 w-10 mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">No conversations found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((conv) => {
                  const duration = getCallDuration(conv);
                  const isSelected = selected?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => { stopPlayback(); setSelected(conv); }}
                      className={cn(
                        "w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 relative",
                        isSelected && "bg-gray-50 border-r-2 border-gray-900"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                            conv.mode === "voice" ? "bg-gray-100" : "bg-gray-100"
                          )}>
                            {conv.mode === "voice"
                              ? <Phone className="h-3.5 w-3.5 text-gray-600" />
                              : <MessageSquare className="h-3.5 w-3.5 text-gray-500" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{conv.callerName || "Anonymous"}</p>
                            <p className="text-xs text-gray-400 truncate">{conv.agent?.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <span className="text-[11px] text-gray-400">{fmtDate(conv.createdAt)}</span>
                          {duration && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {fmtDuration(duration)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5 ml-10">
                        <Badge variant="secondary" className={cn("h-4 text-[9px] px-1.5", conv.mode === "voice" ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-500")}>
                          {conv.mode === "voice" ? "Voice" : "Text"}
                        </Badge>
                        {conv.evaluation && (
                          <Badge variant="secondary" className={cn("h-4 text-[9px] px-1.5 ml-auto",
                            conv.evaluation.passRate >= 80 ? "bg-emerald-100 text-emerald-600" :
                            conv.evaluation.passRate >= 50 ? "bg-amber-100 text-amber-600" :
                            "bg-red-100 text-red-600"
                          )}>
                            {conv.evaluation.passRate >= 80 ? "Success" : "Failed"}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right: Detail panel */}
        <div className="lg:col-span-8 flex gap-4">
          {/* Main content */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <MessageSquare className="h-7 w-7 text-gray-300" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Select a conversation</h3>
                  <p className="text-xs text-gray-400 max-w-xs">Choose from the list to view transcript, evaluation results, and collected data</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Audio player area */}
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">Conversation with {selected.callerName || "User"}</h3>
                      <Badge variant="secondary" className={cn("text-[10px]",
                        selected.mode === "voice" ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {selected.mode === "voice" ? "Voice" : "Text"}
                      </Badge>
                    </div>
                    {selected.agent && (
                      <Link href={`/agents/${selected.agent.id}`}>
                        <button className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition">
                          <ExternalLink className="h-3 w-3" /> View Agent
                        </button>
                      </Link>
                    )}
                  </div>

                  {/* Play button / audio */}
                  {selected.audioUrl ? (
                    <AudioPlayer src={selected.audioUrl} />
                  ) : selected.messages.length > 0 && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => playConversation(selected)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors",
                          playingConvId === selected.id
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                        )}
                      >
                        {playingConvId === selected.id
                          ? <><Square className="h-2.5 w-2.5 fill-current" /> Stop</>
                          : <><Play className="h-2.5 w-2.5 fill-current" /> Play conversation</>}
                      </button>
                      <span className="text-[11px] text-gray-400">{fmtDuration(getCallDuration(selected))}</span>

                      {/* Progress bar when playing */}
                      {playingConvId === selected.id && (() => {
                        const sortedMsgs = [...selected.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                        const timestamps = getTimestamps(sortedMsgs);
                        const totalEst = sortedMsgs.length > 0 ? timestamps[sortedMsgs.length - 1] + estimateDuration(sortedMsgs[sortedMsgs.length - 1].content) : 0;
                        const progress = totalEst > 0 ? Math.min(100, (playbackElapsed / totalEst) * 100) : 0;
                        return (
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-700 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Inner tabs: Transcript / Evaluation / Data / Intelligence */}
                <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
                  <TabsList className="bg-gray-50 rounded-lg p-1 h-auto gap-1 w-fit mx-5 mb-4">
                    <TabsTrigger value="transcript" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5">
                      <FileText className="h-3 w-3" />
                      Transcript
                    </TabsTrigger>
                    <TabsTrigger value="evaluation" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" />
                      Evaluation
                      {selected.evaluation && selected.evaluation.total > 0 && (
                        <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px] bg-gray-200 text-gray-700 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                          {selected.evaluation.passed}/{selected.evaluation.total}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="data" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5">
                      <Database className="h-3 w-3" />
                      Data
                    </TabsTrigger>
                    <TabsTrigger value="intelligence" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      Intelligence
                      {selected.intelligence && (
                        <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px] bg-gray-200 text-gray-700 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                          1
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* Transcript Tab */}
                  <TabsContent value="transcript" className="flex-1 m-0">
                    <ScrollArea className="h-[500px]">
                      {selected.messages.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-8">No messages</p>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {[...selected.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((msg, idx, arr) => {
                            const callStartTs = new Date(arr[0].createdAt).getTime();
                            const msgTs = Math.round((new Date(msg.createdAt).getTime() - callStartTs) / 1000);
                            const label = msg.role === "assistant" ? "TTS" : msg.isVoiceInput ? "ASR" : "Text";
                            const labelColor = msg.role === "assistant" ? "bg-gray-200 text-gray-700" : msg.isVoiceInput ? "bg-gray-200 text-gray-600" : "bg-gray-100 text-gray-500";
                            const isCurrentMsg = playingConvId === selected.id && playingMsgIndex === idx;

                            return (
                              <div key={msg.id} className={cn("flex gap-3 px-5 py-3 transition-colors", isCurrentMsg && "bg-gray-50")}>
                                <div className="flex flex-col items-center shrink-0 pt-1">
                                  <div className={cn(
                                    "w-2.5 h-2.5 rounded-full border-2 transition-all",
                                    msg.role === "assistant"
                                      ? isCurrentMsg ? "bg-gray-800 border-gray-800 scale-125" : "bg-gray-700 border-gray-700"
                                      : isCurrentMsg ? "bg-gray-500 border-gray-500 scale-125" : "bg-white border-gray-400"
                                  )} />
                                  {idx < arr.length - 1 && <div className="w-px flex-1 mt-1 bg-gray-200 min-h-[16px]" />}
                                </div>
                                <div className="flex-1 min-w-0 pb-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={cn("text-xs font-semibold", msg.role === "assistant" ? "text-gray-900" : "text-gray-700")}>
                                      {msg.role === "assistant" ? selected.agent?.name || "Agent" : selected.callerName || "User"}
                                    </span>
                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", labelColor)}>{label}</span>
                                    <span className="text-[11px] text-gray-400 tabular-nums ml-auto">{fmtDuration(msgTs)}</span>
                                  </div>
                                  <p className={cn("text-sm leading-relaxed", msg.role === "assistant" ? "text-gray-700" : "text-gray-600", isCurrentMsg && "text-gray-900")}>{msg.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  {/* Evaluation Tab */}
                  <TabsContent value="evaluation" className="flex-1 m-0">
                    <ScrollArea className="h-[500px]">
                      <div className="p-5">
                        {loadingAnalysis ? (
                          <p className="text-xs text-gray-400 text-center py-8">Loading evaluation...</p>
                        ) : evalResults.length === 0 ? (
                          <div className="text-center py-12">
                            <CheckCircle2 className="h-10 w-10 mx-auto text-gray-200 mb-3" />
                            <p className="text-sm text-gray-500 font-medium">No evaluation results</p>
                            <p className="text-xs text-gray-400 mt-1.5">Evaluation results will appear here after analysis</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {evalResults.map(result => (
                              <div key={result.id} className={cn(
                                "border rounded-lg p-3",
                                result.result ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
                              )}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    {result.result
                                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                      : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                                    <span className="text-xs font-medium text-gray-900">{result.criterionName}</span>
                                  </div>
                                  <Badge variant="secondary" className={cn("text-[10px]",
                                    result.result ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                  )}>
                                    {result.result ? "Success" : "Failed"}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-gray-500 leading-relaxed">{result.analysis}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Data Tab */}
                  <TabsContent value="data" className="flex-1 m-0">
                    <ScrollArea className="h-[500px]">
                      <div className="p-5">
                        {loadingAnalysis ? (
                          <p className="text-xs text-gray-400 text-center py-8">Loading data...</p>
                        ) : collectedData.length === 0 ? (
                          <div className="text-center py-12">
                            <Database className="h-10 w-10 mx-auto text-gray-200 mb-3" />
                            <p className="text-sm text-gray-500 font-medium">No client data</p>
                            <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto">
                              This conversation did not collect any data. When sent, client overrides, custom LLM body, and dynamic variables will be shown.
                            </p>
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Field</th>
                                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Type</th>
                                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {collectedData.map(item => {
                                  let displayValue: React.ReactNode;
                                  try {
                                    const parsed = JSON.parse(item.value);
                                    if (Array.isArray(parsed)) {
                                      displayValue = <div className="flex flex-wrap gap-1">{parsed.map((v, i) => <Badge key={i} variant="secondary" className="text-[10px] bg-gray-100 text-gray-700">{String(v)}</Badge>)}</div>;
                                    } else if (typeof parsed === "boolean") {
                                      displayValue = <Badge variant="secondary" className={cn("text-xs", parsed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>{parsed ? "Yes" : "No"}</Badge>;
                                    } else {
                                      displayValue = <span className="text-sm text-gray-900">{String(parsed)}</span>;
                                    }
                                  } catch {
                                    displayValue = <span className="text-sm text-gray-900">{item.value}</span>;
                                  }
                                  return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{item.dataPointName}</td>
                                      <td className="px-4 py-2.5"><Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600">{item.dataType}</Badge></td>
                                      <td className="px-4 py-2.5">{displayValue}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Intelligence Tab */}
                  <TabsContent value="intelligence" className="flex-1 m-0">
                    <ScrollArea className="h-[500px]">
                      <div className="p-5">
                        {loadingAnalysis ? (
                          <p className="text-xs text-gray-400 text-center py-8">Loading intelligence...</p>
                        ) : !selected.intelligence ? (
                          <div className="text-center py-12">
                            <Sparkles className="h-10 w-10 mx-auto text-gray-200 mb-3" />
                            <p className="text-sm text-gray-500 font-medium">No intelligence generated</p>
                            <p className="text-xs text-gray-400 mt-1.5">Intelligence is generated when conversations end</p>
                          </div>
                        ) : (
                          <IntelligencePortrait intelligence={selected.intelligence} variant="full" />
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>

                {/* Footer */}
                {selected.status !== "active" && (
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <PhoneOff className="h-3 w-3" />
                    <span>Conversation ended</span>
                    {getCallDuration(selected) && <span>&middot; Total: {fmtDuration(getCallDuration(selected))}</span>}
                  </div>
                )}
                {selected.status === "active" && (
                  <div className="px-5 py-2.5 border-t border-gray-100 bg-emerald-50 flex items-center justify-center gap-2 text-xs text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Conversation in progress
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadata sidebar (only when conversation selected) */}
          {selected && (
            <div className="w-[200px] shrink-0 bg-white border border-gray-200 rounded-xl p-4 space-y-4 h-fit">
              <h3 className="text-xs font-semibold text-gray-900 mb-3">Metadata</h3>

              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
                <p className="text-xs text-gray-700">{fmtFullDate(selected.createdAt)}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Conversation duration</p>
                <p className="text-xs text-gray-700">{fmtDuration(getCallDuration(selected))}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Mode</p>
                <p className="text-xs text-gray-700">{selected.mode === "voice" ? "Voice call" : "Text chat"}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Source</p>
                <p className="text-xs text-gray-700">{sourceLabel(selected.source)}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Messages</p>
                <p className="text-xs text-gray-700">{selected.messages.length}</p>
              </div>

              {selected.sentiment && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Sentiment</p>
                  <Badge className={cn("text-[10px] border-0", sentimentColor(selected.sentiment))}>{selected.sentiment}</Badge>
                </div>
              )}

              {selected.evaluation && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Evaluation</p>
                  <Badge className={cn("text-[10px] border-0",
                    selected.evaluation.passRate >= 80 ? "bg-emerald-100 text-emerald-700" :
                    selected.evaluation.passRate >= 50 ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {selected.evaluation.passed}/{selected.evaluation.total} passed
                  </Badge>
                </div>
              )}

              {selected.callerEmail && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-xs text-gray-700 break-all">{selected.callerEmail}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
