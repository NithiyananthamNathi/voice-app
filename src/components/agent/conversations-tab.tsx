"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  MessageSquare, Mic, Phone, Clock, User, Search,
  ChevronRight, CheckCircle2, XCircle, Database,
  FileText, Calendar, Globe, PhoneOff, Hash,
  Sparkles, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IntelligencePortrait } from "@/components/agent/intelligence-portrait";
import type { ConversationIntelligence } from "@/lib/store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  isVoiceInput?: boolean;
  createdAt: string;
}

interface EvalSummary {
  total: number;
  passed: number;
  passRate: number;
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

interface Conversation {
  id: string;
  mode: string;
  status: string;
  duration: number | null;
  callerName: string | null;
  callerEmail: string | null;
  callerPhone: string | null;
  summary: string | null;
  sentiment: string | null;
  source: string;
  createdAt: string;
  endedAt: string | null;
  messages: Message[];
  messageCount: number;
  evaluation: EvalSummary | null;
  intelligence: ConversationIntelligence | null;
}

interface ConversationsTabProps {
  agentId: string;
  agentName: string;
  conversations: Conversation[];
}

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

// Persona legend data
const PERSONA_LEGEND = [
  { abbr: "AW", full: "Anxious Worrier", desc: "Stressed and seeking reassurance" },
  { abbr: "IS", full: "Information Seeker", desc: "Wants to learn and understand" },
  { abbr: "SP", full: "Symptom Presenter", desc: "Focused on specific symptoms" },
  { abbr: "SK", full: "Skeptical Questioner", desc: "Doubtful, needs convincing" },
  { abbr: "CG", full: "Caregiver", desc: "Seeking info for someone else" },
  { abbr: "PE", full: "Proactive Explorer", desc: "Preventive health focused" },
  { abbr: "DTA", full: "Decision-Torn Ambivalent", desc: "Struggling with choices" },
  { abbr: "CP", full: "Chronic Patient", desc: "Managing ongoing condition" },
];

const sourceLabel = (source: string) => {
  if (source === "widget") return "Public URL";
  if (source === "dashboard") return "Dashboard";
  if (source === "api") return "API";
  return source;
};

const getCallDuration = (conv: Conversation) => {
  if (conv.duration) return conv.duration;
  if (conv.messages.length < 2) return null;
  const first = new Date(conv.messages[0].createdAt).getTime();
  const last = new Date(conv.messages[conv.messages.length - 1].createdAt).getTime();
  return Math.round((last - first) / 1000);
};

export function ConversationsTab({ agentId, agentName, conversations }: ConversationsTabProps) {
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [evalResults, setEvalResults] = useState<EvaluationResult[]>([]);
  const [collectedData, setCollectedData] = useState<CollectedDataItem[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.callerName?.toLowerCase().includes(q) ||
      c.callerEmail?.toLowerCase().includes(q) ||
      c.messages.some(m => m.content.toLowerCase().includes(q));
    return matchSearch && (filterMode === "all" || c.mode === filterMode);
  });

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

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: conversations.length, icon: Hash, color: "text-gray-600 bg-gray-100", showInfo: false },
          { label: "Voice", value: conversations.filter(c => c.mode === "voice").length, icon: Phone, color: "text-emerald-600 bg-emerald-50", showInfo: false },
          { label: "Text", value: conversations.filter(c => c.mode === "text").length, icon: MessageSquare, color: "text-violet-600 bg-violet-50", showInfo: false },
          { label: "Analyzed", value: conversations.filter(c => c.intelligence !== null).length, icon: Sparkles, color: "text-purple-600 bg-purple-50", showInfo: true },
          { label: "Avg Pass Rate", value: (() => {
            const withEval = conversations.filter(c => c.evaluation);
            if (withEval.length === 0) return "--";
            const avg = Math.round(withEval.reduce((s, c) => s + (c.evaluation?.passRate || 0), 0) / withEval.length);
            return `${avg}%`;
          })(), icon: CheckCircle2, color: "text-amber-600 bg-amber-50", showInfo: false },
        ].map(({ label, value, icon: Icon, color, showInfo }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-gray-500">{label}</p>
                {showInfo && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-purple-100 rounded-full"
                      >
                        <Info className="h-3 w-3 text-purple-600" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b pb-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <h4 className="font-semibold text-sm text-slate-900">Persona Badge Legend</h4>
                        </div>
                        <p className="text-xs text-slate-600">
                          Purple badges show the detected persona type. Here's what each abbreviation means:
                        </p>
                        <div className="space-y-2 max-h-[280px] overflow-y-auto">
                          {PERSONA_LEGEND.map((persona) => (
                            <div key={persona.abbr} className="flex gap-2 items-start">
                              <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 font-mono shrink-0 w-11 justify-center">
                                {persona.abbr}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-900">{persona.full}</p>
                                <p className="text-[11px] text-slate-500">{persona.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <p className="text-lg font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-gray-50 border-gray-200 h-9" />
          </div>
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
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left: Conversation list */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
            <span className="text-xs text-gray-400">{filtered.length} results</span>
          </div>
          <ScrollArea className="h-[640px]">
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
                      onClick={() => setSelected(conv)}
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
                            <p className="text-xs text-gray-400 truncate">{conv.messageCount} messages</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <span className="text-[11px] text-gray-400" suppressHydrationWarning>{fmtDate(conv.createdAt)}</span>
                          {duration && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {fmtDuration(duration)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Eval badge */}
                      <div className="flex items-center gap-1.5 mt-1.5 ml-10 flex-wrap">
                        <Badge variant="secondary" className={cn("h-4 text-[9px] px-1.5", conv.mode === "voice" ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-500")}>
                          {conv.mode === "voice" ? "Voice" : "Text"}
                        </Badge>
                        <Badge variant="secondary" className="h-4 text-[9px] px-1.5 bg-gray-100 text-gray-500">
                          {sourceLabel(conv.source)}
                        </Badge>
                        {conv.intelligence && (
                          <Badge variant="secondary" className="h-4 text-[9px] px-1.5 bg-purple-100 text-purple-700">
                            <Sparkles className="h-2 w-2 mr-0.5" />
                            {conv.intelligence.personaArchetype.split('_').map(w => w.charAt(0)).join('')}
                          </Badge>
                        )}
                        {conv.evaluation && (
                          <Badge variant="secondary" className={cn("h-4 text-[9px] px-1.5",
                            !conv.intelligence && "ml-auto",
                            conv.evaluation.passRate >= 80 ? "bg-emerald-100 text-emerald-600" :
                            conv.evaluation.passRate >= 50 ? "bg-amber-100 text-amber-600" :
                            "bg-red-100 text-red-600"
                          )}>
                            <CheckCircle2 className="h-2 w-2 mr-0.5" />
                            {conv.evaluation.passRate}%
                          </Badge>
                        )}
                        <Badge variant="secondary" className={cn("h-4 text-[9px] px-1.5",
                          !conv.evaluation && !conv.intelligence && "ml-auto",
                          conv.status === "active" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                        )}>
                          {conv.status}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right: Detail panel */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
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
              {/* Conversation Title Header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900">
                    Conversation with {selected.callerName || "User"}
                  </h3>
                  <Badge variant="secondary" className={cn("text-[10px]",
                    selected.mode === "voice" ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-500"
                  )}>
                    {selected.mode === "voice" ? "Voice" : "Text"}
                  </Badge>
                </div>
                
                {/* Audio player if available */}
                {selected.mode === "voice" && selected.messages.length > 0 && (
                  <div className="space-y-1.5">
                    {selected.messages.filter(m => m.audioUrl).length > 0 ? (
                      <div className="space-y-2">
                        {selected.messages
                          .filter(m => m.audioUrl)
                          .map((msg) => (
                            <div key={msg.id} className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500 w-12 shrink-0 font-medium">
                                {msg.role === "assistant" ? "Agent" : "User"}
                              </span>
                              <audio
                                src={msg.audioUrl}
                                controls
                                className="flex-1 h-7"
                                style={{ accentColor: "#1f2937" }}
                              />
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        <Mic className="h-3 w-3 inline mr-1" />
                        Voice conversation · Audio playback available on main Conversations page
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Detail Header */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-11 w-11 rounded-full flex items-center justify-center text-lg font-semibold",
                      selected.mode === "voice" ? "bg-gray-100 text-gray-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {selected.callerName?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selected.callerName || "Anonymous"}</h3>
                      {selected.callerEmail && <p className="text-xs text-gray-500">{selected.callerEmail}</p>}
                    </div>
                  </div>
                  {selected.evaluation && (
                    <div className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold",
                      selected.evaluation.passRate >= 80 ? "bg-emerald-100 text-emerald-700" :
                      selected.evaluation.passRate >= 50 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {selected.evaluation.passed}/{selected.evaluation.total} passed ({selected.evaluation.passRate}%)
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg" suppressHydrationWarning>
                    <Calendar className="h-3 w-3" />{fmtFullDate(selected.createdAt)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                    <Clock className="h-3 w-3" />{fmtDuration(getCallDuration(selected))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-gray-50 px-2.5 py-1 rounded-lg">
                    {selected.mode === "voice"
                      ? <><Phone className="h-3 w-3 text-gray-500" /><span className="text-gray-700">Voice</span></>
                      : <><MessageSquare className="h-3 w-3 text-gray-400" /><span className="text-gray-500">Text</span></>}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                    <Globe className="h-3 w-3" /> {sourceLabel(selected.source)}
                  </div>
                </div>
              </div>

              {/* Inner tabs */}
              <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
                <TabsList className="bg-gray-50 rounded-lg p-1 h-auto gap-1 w-fit mx-5 mb-4">
                  <TabsTrigger value="transcript" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />Transcript
                  </TabsTrigger>
                  <TabsTrigger value="evaluation" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Evaluation
                    {selected.evaluation && (
                      <Badge variant="secondary" className={cn("ml-1.5 h-4 text-[9px] px-1.5",
                        selected.evaluation.passRate >= 80 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {selected.evaluation.passRate}%
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="data" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200">
                    <Database className="h-3.5 w-3.5 mr-1.5" />Data
                  </TabsTrigger>
                  <TabsTrigger value="intelligence" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />Intelligence
                    {selected.intelligence && (
                      <Badge variant="secondary" className="ml-1.5 h-4 text-[9px] px-1.5 bg-blue-100 text-blue-600">
                        AI
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Transcript Tab */}
                <TabsContent value="transcript" className="flex-1 m-0">
                  <ScrollArea className="h-[440px]">
                    {selected.messages.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-8">No messages</p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {[...selected.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((msg, idx, arr) => {
                          const callStartTs = new Date(arr[0].createdAt).getTime();
                          const msgTs = Math.round((new Date(msg.createdAt).getTime() - callStartTs) / 1000);
                          const label = msg.role === "assistant" ? "TTS" : msg.isVoiceInput ? "ASR" : "Text";
                          const labelColor = msg.role === "assistant" ? "bg-gray-200 text-gray-700" : msg.isVoiceInput ? "bg-gray-200 text-gray-600" : "bg-gray-100 text-gray-500";

                          return (
                            <div key={msg.id} className="flex gap-3 px-5 py-3">
                              <div className="flex flex-col items-center shrink-0 pt-1">
                                <div className={cn(
                                  "w-2.5 h-2.5 rounded-full border-2",
                                  msg.role === "assistant" ? "bg-gray-700 border-gray-700" : "bg-white border-gray-400"
                                )} />
                                {idx < arr.length - 1 && <div className="w-px flex-1 mt-1 bg-gray-200 min-h-[16px]" />}
                              </div>
                              <div className="flex-1 min-w-0 pb-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={cn("text-xs font-semibold", msg.role === "assistant" ? "text-gray-900" : "text-gray-700")}>
                                    {msg.role === "assistant" ? agentName : selected.callerName || "User"}
                                  </span>
                                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", labelColor)}>{label}</span>
                                  <span className="text-[11px] text-gray-400 tabular-nums ml-auto">{fmtDuration(msgTs)}</span>
                                </div>
                                <p className={cn("text-sm leading-relaxed", msg.role === "assistant" ? "text-gray-700" : "text-gray-600")}>{msg.content}</p>
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
                  <ScrollArea className="h-[440px]">
                    <div className="p-5 space-y-3">
                      {loadingAnalysis ? (
                        <p className="text-xs text-gray-400 text-center py-8">Loading analysis...</p>
                      ) : evalResults.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="h-10 w-10 mx-auto text-gray-200 mb-3" />
                          <p className="text-sm text-gray-400">No evaluation results</p>
                          <p className="text-xs text-gray-400 mt-1">Analysis runs when conversations end</p>
                        </div>
                      ) : (
                        evalResults.map(result => (
                          <div key={result.id} className={cn(
                            "border rounded-lg p-4",
                            result.result ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
                          )}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {result.result
                                  ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  : <XCircle className="h-4 w-4 text-red-500" />}
                                <span className="text-sm font-medium text-gray-900">{result.criterionName}</span>
                              </div>
                              {result.type === "score" && result.score !== null && (
                                <Badge variant="secondary" className={cn("text-xs",
                                  result.score >= 7 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                )}>
                                  Score: {result.score}/10
                                </Badge>
                              )}
                              {result.type === "boolean" && (
                                <Badge variant="secondary" className={cn("text-xs",
                                  result.result ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                )}>
                                  {result.result ? "Pass" : "Fail"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{result.analysis}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Data Tab */}
                <TabsContent value="data" className="flex-1 m-0">
                  <ScrollArea className="h-[440px]">
                    <div className="p-5">
                      {loadingAnalysis ? (
                        <p className="text-xs text-gray-400 text-center py-8">Loading data...</p>
                      ) : collectedData.length === 0 ? (
                        <div className="text-center py-8">
                          <Database className="h-10 w-10 mx-auto text-gray-200 mb-3" />
                          <p className="text-sm text-gray-400">No collected data</p>
                          <p className="text-xs text-gray-400 mt-1">Data collection runs when conversations end</p>
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
                                    displayValue = (
                                      <div className="flex flex-wrap gap-1">
                                        {parsed.map((v, i) => (
                                          <Badge key={i} variant="secondary" className="text-[10px] bg-gray-100 text-gray-700">{String(v)}</Badge>
                                        ))}
                                      </div>
                                    );
                                  } else if (typeof parsed === "boolean") {
                                    displayValue = (
                                      <Badge variant="secondary" className={cn("text-xs", parsed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                        {parsed ? "Yes" : "No"}
                                      </Badge>
                                    );
                                  } else {
                                    displayValue = <span className="text-sm text-gray-900">{String(parsed)}</span>;
                                  }
                                } catch {
                                  displayValue = <span className="text-sm text-gray-900">{item.value}</span>;
                                }

                                return (
                                  <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{item.dataPointName}</td>
                                    <td className="px-4 py-2.5">
                                      <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600">{item.dataType}</Badge>
                                    </td>
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
                  <ScrollArea className="h-[440px]">
                    <div className="p-5">
                      {loadingAnalysis ? (
                        <p className="text-xs text-gray-400 text-center py-8">Loading intelligence...</p>
                      ) : !selected.intelligence ? (
                        <div className="text-center py-8">
                          <Sparkles className="h-10 w-10 mx-auto text-gray-200 mb-3" />
                          <p className="text-sm text-gray-400">No intelligence generated</p>
                          <p className="text-xs text-gray-400 mt-1">Intelligence is generated when conversations end</p>
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
      </div>
    </div>
  );
}
