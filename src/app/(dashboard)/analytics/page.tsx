"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare, Clock, TrendingUp, Mic, Loader2, Phone,
  CheckCircle2, XCircle, Database, Hash, Activity, BarChart3,
  Sparkles, LineChart as LineChartIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { IntelligenceAnalytics } from "@/components/agent/intelligence-analytics";
import { IntelligenceTrends } from "@/components/agent/intelligence-trends";
import { IntelligenceComparison } from "@/components/agent/intelligence-comparison";
import type { ConversationIntelligence } from "@/lib/store";

interface Message {
  id: string;
  role: string;
  content: string;
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
  callerName: string | null;
  sentiment: string | null;
  source: string;
  createdAt: string;
  endedAt: string | null;
  messages: Message[];
  messageCount: number;
  evaluation: EvalSummary | null;
  intelligence: ConversationIntelligence | null;
  agentId?: string;
  agentName?: string;
}

interface Agent {
  id: string;
  name: string;
  isActive: boolean;
  isPublic: boolean;
  conversationCount: number;
  evaluationCriteria: { id: string; name: string; isActive: boolean }[];
  dataCollectionPoints: { id: string; name: string; isActive: boolean }[];
}

interface AgentConvData {
  agent: Agent;
  conversations: Conversation[];
  stats: { totalConversations: number; totalDuration: number; avgDuration: number };
}

export default function AnalyticsPage() {
  const [agentData, setAgentData] = useState<AgentConvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [filterAgent, setFilterAgent] = useState("all");

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const agentsRes = await fetch("/api/agents", { credentials: "include" });
      if (!agentsRes.ok) return;
      const agents: Agent[] = await agentsRes.json();

      const data: AgentConvData[] = [];
      await Promise.all(agents.map(async (agent) => {
        const convRes = await fetch(`/api/agents/${agent.id}/conversations`, { credentials: "include" });
        if (convRes.ok) {
          const convData = await convRes.json();
          data.push({
            agent,
            conversations: convData.conversations || [],
            stats: convData.stats || { totalConversations: 0, totalDuration: 0, avgDuration: 0 },
          });
        }
      }));
      setAgentData(data);
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter by time range and agent
  const filteredData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date(Date.now() - days * 86400000);

    return agentData
      .filter(d => filterAgent === "all" || d.agent.id === filterAgent)
      .map(d => ({
        ...d,
        conversations: d.conversations
          .filter(c => new Date(c.createdAt) >= cutoff)
          .map(c => ({ ...c, agentId: d.agent.id, agentName: d.agent.name })),
      }));
  }, [agentData, timeRange, filterAgent]);

  const allConversations = filteredData.flatMap(d => d.conversations);
  const totalConversations = allConversations.length;
  const voiceCount = allConversations.filter(c => c.mode === "voice").length;
  const textCount = allConversations.filter(c => c.mode === "text").length;
  const totalDuration = allConversations.reduce((s, c) => s + (c.duration || 0), 0);
  const avgDuration = totalConversations > 0 ? Math.round(totalDuration / totalConversations) : 0;
  const activeCount = allConversations.filter(c => c.status === "active").length;

  const withEval = allConversations.filter(c => c.evaluation);
  const avgPassRate = withEval.length > 0
    ? Math.round(withEval.reduce((s, c) => s + (c.evaluation?.passRate || 0), 0) / withEval.length)
    : null;

  // Chart data
  const chartData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const now = new Date();
    const data: { date: string; conversations: number; voice: number; text: number; label: string }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString([], { month: "short", day: "numeric" });
      const dayConvs = allConversations.filter(c => c.createdAt.startsWith(dateStr));
      data.push({
        date: dateStr,
        conversations: dayConvs.length,
        voice: dayConvs.filter(c => c.mode === "voice").length,
        text: dayConvs.filter(c => c.mode === "text").length,
        label,
      });
    }
    return data;
  }, [allConversations, timeRange]);

  // Agent performance
  const agentPerformance = useMemo(() => {
    return filteredData.map(d => {
      const withEval = d.conversations.filter(c => c.evaluation);
      const passRate = withEval.length > 0
        ? Math.round(withEval.reduce((s, c) => s + (c.evaluation?.passRate || 0), 0) / withEval.length)
        : null;
      return {
        name: d.agent.name,
        id: d.agent.id,
        conversations: d.conversations.length,
        voiceCount: d.conversations.filter(c => c.mode === "voice").length,
        avgDuration: d.conversations.length > 0
          ? Math.round(d.conversations.reduce((s, c) => s + (c.duration || 0), 0) / d.conversations.length)
          : 0,
        passRate,
        isActive: d.agent.isActive,
        isPublic: d.agent.isPublic,
        criteriaCount: d.agent.evaluationCriteria?.filter(c => c.isActive).length || 0,
        dataPointCount: d.agent.dataCollectionPoints?.filter(d => d.isActive).length || 0,
        evaluatedCount: withEval.length,
        evaluationRate: d.conversations.length > 0 
          ? Math.round((withEval.length / d.conversations.length) * 100)
          : 0,
      };
    }).sort((a, b) => b.conversations - a.conversations);
  }, [filteredData]);

  // Evaluation criteria & data collection analysis
  const analysisMetrics = useMemo(() => {
    const totalCriteria = agentData.reduce((sum, d) => 
      sum + (d.agent.evaluationCriteria?.filter(c => c.isActive).length || 0), 0
    );
    const totalDataPoints = agentData.reduce((sum, d) => 
      sum + (d.agent.dataCollectionPoints?.filter(p => p.isActive).length || 0), 0
    );
    const evaluatedConvs = allConversations.filter(c => c.evaluation);
    const evaluationRate = totalConversations > 0 
      ? Math.round((evaluatedConvs.length / totalConversations) * 100)
      : 0;
    
    return {
      totalCriteria,
      totalDataPoints,
      evaluatedCount: evaluatedConvs.length,
      evaluationRate,
      avgCriteriaPerAgent: agentData.length > 0 
        ? Math.round(totalCriteria / agentData.length)
        : 0,
      avgDataPointsPerAgent: agentData.length > 0
        ? Math.round(totalDataPoints / agentData.length)
        : 0,
    };
  }, [agentData, allConversations, totalConversations]);

  // Sentiment breakdown
  const sentimentCounts = useMemo(() => {
    const positive = allConversations.filter(c => c.sentiment === "positive").length;
    const neutral = allConversations.filter(c => c.sentiment === "neutral").length;
    const negative = allConversations.filter(c => c.sentiment === "negative").length;
    return { positive, neutral, negative };
  }, [allConversations]);

  const fmtDuration = (s: number) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analysis Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Evaluation criteria & data collection insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterAgent} onValueChange={setFilterAgent}>
            <SelectTrigger className="w-[180px] bg-white border-gray-200 h-9">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Agents</SelectItem>
              {agentData.map(d => <SelectItem key={d.agent.id} value={d.agent.id}>{d.agent.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] bg-white border-gray-200 h-9">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Analysis Metrics - Main Focus */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { 
            label: "Eval Pass Rate", 
            value: avgPassRate !== null ? `${avgPassRate}%` : "--", 
            icon: CheckCircle2, 
            color: avgPassRate !== null && avgPassRate >= 80 
              ? "text-emerald-600 bg-emerald-50" 
              : avgPassRate !== null && avgPassRate >= 50
              ? "text-amber-600 bg-amber-50"
              : "text-red-600 bg-red-50",
            subtitle: `${analysisMetrics.evaluatedCount} evaluated`
          },
          { 
            label: "Evaluation Rate", 
            value: `${analysisMetrics.evaluationRate}%`, 
            icon: BarChart3, 
            color: "text-violet-600 bg-violet-50",
            subtitle: `${totalConversations - analysisMetrics.evaluatedCount} pending`
          },
          { 
            label: "Total Criteria", 
            value: analysisMetrics.totalCriteria, 
            icon: CheckCircle2, 
            color: "text-blue-600 bg-blue-50",
            subtitle: `~${analysisMetrics.avgCriteriaPerAgent} per agent`
          },
          { 
            label: "Data Points", 
            value: analysisMetrics.totalDataPoints, 
            icon: Database, 
            color: "text-purple-600 bg-purple-50",
            subtitle: `~${analysisMetrics.avgDataPointsPerAgent} per agent`
          },
          { 
            label: "Total Calls", 
            value: totalConversations, 
            icon: Hash, 
            color: "text-gray-600 bg-gray-50",
            subtitle: `${voiceCount} voice, ${textCount} text`
          },
          { 
            label: "Avg Duration", 
            value: fmtDuration(avgDuration), 
            icon: Clock, 
            color: "text-amber-600 bg-amber-50",
            subtitle: "per conversation"
          },
        ].map(({ label, value, icon: Icon, color, subtitle }) => (
          <Card key={label} className="bg-white border-gray-200">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-gray-500 truncate">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  {subtitle && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{subtitle}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row - Analysis focused */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Evaluation Overview - Prominent */}
        {avgPassRate !== null ? (
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Evaluation Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className={cn("text-5xl font-bold",
                  avgPassRate >= 80 ? "text-emerald-600" : avgPassRate >= 50 ? "text-amber-600" : "text-red-600"
                )}>{avgPassRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Average Pass Rate</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Evaluated</span>
                  <span className="font-semibold text-emerald-600">{withEval.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-amber-600">{totalConversations - withEval.length}</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-semibold text-gray-900">{analysisMetrics.evaluationRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-400" />
                Evaluation Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-gray-400">No evaluations yet</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sentiment */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-900">Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Positive", count: sentimentCounts.positive, color: "bg-emerald-500", textColor: "text-emerald-600" },
              { label: "Neutral", count: sentimentCounts.neutral, color: "bg-gray-400", textColor: "text-gray-600" },
              { label: "Negative", count: sentimentCounts.negative, color: "bg-red-500", textColor: "text-red-600" },
            ].map(s => {
              const pct = totalConversations > 0 ? Math.round((s.count / totalConversations) * 100) : 0;
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{s.label}</span>
                    <span className={cn("text-xs font-semibold", s.textColor)}>{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", s.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Conversation volume chart */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              Volume Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Area type="monotone" dataKey="conversations" name="Calls" stroke="#6b7280" fill="url(#colorTotal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-600" />
            Agent Analysis Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {agentPerformance.length === 0 ? (
            <div className="text-center py-12 px-4">
              <BarChart3 className="h-10 w-10 mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No agents created yet</p>
              <Link href="/agents/new" className="text-sm text-gray-600 hover:text-gray-800 mt-2 inline-block">Create your first agent</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 border-t">
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-2.5">Agent</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Eval Pass Rate</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Evaluation Rate</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Criteria</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Data Points</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Conversations</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Voice / Text</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agentPerformance.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <Link href={`/agents/${a.id}`} className="text-sm font-medium text-gray-600 hover:text-gray-800">{a.name}</Link>
                      </td>
                      <td className="px-4 py-3">
                        {a.passRate !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full",
                                a.passRate >= 80 ? "bg-emerald-500" : a.passRate >= 50 ? "bg-amber-500" : "bg-red-500"
                              )} style={{ width: `${a.passRate}%` }} />
                            </div>
                            <span className={cn("text-xs font-semibold min-w-[32px]",
                              a.passRate >= 80 ? "text-emerald-600" : a.passRate >= 50 ? "text-amber-600" : "text-red-600"
                            )}>{a.passRate}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 font-medium">{a.evaluationRate}%</span>
                          <span className="text-xs text-gray-400">({a.evaluatedCount}/{a.conversations})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 h-5">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />{a.criteriaCount}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-700 h-5">
                          <Database className="h-2.5 w-2.5 mr-0.5" />{a.dataPointCount}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{a.conversations}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] bg-gray-50 text-gray-600 h-5">
                            <Phone className="h-2 w-2 mr-0.5" />{a.voiceCount}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 h-5">
                            <MessageSquare className="h-2 w-2 mr-0.5" />{a.conversations - a.voiceCount}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={cn("text-[10px] h-5",
                          a.isPublic ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                        )}>
                          {a.isPublic ? "Live" : "Draft"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluated conversations with analysis focus */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Recent Evaluated Conversations
            </CardTitle>
            <Link href="/conversations" className="text-xs text-gray-600 hover:text-gray-800 font-medium">View all</Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {allConversations.filter(c => c.evaluation).length === 0 ? (
            <div className="text-center py-8 px-4">
              <CheckCircle2 className="h-10 w-10 mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No evaluated conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {allConversations
                .filter(c => c.evaluation)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 12)
                .map(conv => {
                  const agentName = agentData.find(d => d.conversations.some(c => c.id === conv.id))?.agent.name;
                  return (
                    <div key={conv.id} className="px-5 py-3 flex items-center gap-4">
                      <div className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                        conv.evaluation && conv.evaluation.passRate >= 80 
                          ? "bg-emerald-100" 
                          : conv.evaluation && conv.evaluation.passRate >= 50 
                          ? "bg-amber-100" 
                          : "bg-red-100"
                      )}>
                        {conv.evaluation && conv.evaluation.passRate >= 80 
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          : conv.evaluation && conv.evaluation.passRate >= 50
                          ? <CheckCircle2 className="h-4 w-4 text-amber-600" />
                          : <XCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{conv.callerName || "Anonymous"}</p>
                          {agentName && <span className="text-xs text-gray-400 truncate">&middot; {agentName}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className={cn("h-4 text-[9px] px-1.5",
                            conv.mode === "voice" ? "bg-gray-100 text-gray-600" : "bg-gray-100 text-gray-500"
                          )}>{conv.mode}</Badge>
                          <span className="text-xs text-gray-400">{conv.messageCount} msgs</span>
                          {conv.sentiment && (
                            <Badge variant="secondary" className={cn("h-4 text-[9px] px-1.5",
                              conv.sentiment === "positive" ? "bg-emerald-100 text-emerald-600" :
                              conv.sentiment === "negative" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                            )}>{conv.sentiment}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {conv.evaluation && (
                          <Badge variant="secondary" className={cn("h-5 text-[10px] px-2 font-semibold",
                            conv.evaluation.passRate >= 80 ? "bg-emerald-100 text-emerald-700" :
                            conv.evaluation.passRate >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          )}>
                            {conv.evaluation.passRate}% ({conv.evaluation.passed}/{conv.evaluation.total})
                          </Badge>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {new Date(conv.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intelligence Analytics Section */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-gray-900">AI Conversation Intelligence</CardTitle>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Deep psychological and behavioral insights extracted from conversations
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="trends" className="gap-2">
                <LineChartIcon className="w-4 h-4" />
                Trends & Insights
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Agent Comparison
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <IntelligenceAnalytics 
                conversations={allConversations.map(c => ({
                  id: c.id,
                  createdAt: c.createdAt,
                  intelligence: c.intelligence,
                }))}
              />
            </TabsContent>
            
            <TabsContent value="trends">
              <IntelligenceTrends
                conversations={allConversations.map(c => ({
                  id: c.id,
                  createdAt: c.createdAt,
                  intelligence: c.intelligence,
                }))}
              />
            </TabsContent>
            
            <TabsContent value="comparison">
              <IntelligenceComparison
                conversations={allConversations
                  .filter(c => c.intelligence !== null && c.agentId && c.agentName)
                  .map(c => ({
                    id: c.id,
                    agentId: c.agentId!,
                    agentName: c.agentName!,
                    createdAt: c.createdAt,
                    intelligence: c.intelligence!,
                  }))}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
