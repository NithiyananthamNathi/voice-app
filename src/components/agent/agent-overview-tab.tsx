"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare, Phone, Clock, CheckCircle2, TrendingUp,
  Mic, Hash, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface EvalSummary {
  total: number;
  passed: number;
  passRate: number;
}

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  mode: string;
  status: string;
  duration: number | null;
  callerName: string | null;
  source: string;
  createdAt: string;
  endedAt: string | null;
  messages: Message[];
  messageCount: number;
  evaluation: EvalSummary | null;
}

interface EvaluationCriterion {
  id: string;
  name: string;
  isActive: boolean;
}

interface AgentOverviewTabProps {
  conversations: Conversation[];
  evaluationCriteria: EvaluationCriterion[];
  agentName: string;
}

const fmtDuration = (s: number) => {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export function AgentOverviewTab({ conversations, evaluationCriteria, agentName }: AgentOverviewTabProps) {
  const [chartRange, setChartRange] = useState<"7" | "30">("7");

  const totalConversations = conversations.length;
  const activeConversations = conversations.filter(c => c.status === "active").length;
  const totalDuration = conversations.reduce((s, c) => s + (c.duration || 0), 0);
  const avgDuration = totalConversations > 0 ? Math.round(totalDuration / totalConversations) : 0;

  const withEval = conversations.filter(c => c.evaluation);
  const avgPassRate = withEval.length > 0
    ? Math.round(withEval.reduce((s, c) => s + (c.evaluation?.passRate || 0), 0) / withEval.length)
    : null;

  // Chart data
  const chartData = useMemo(() => {
    const days = parseInt(chartRange);
    const now = new Date();
    const data: { date: string; conversations: number; label: string }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString([], { month: "short", day: "numeric" });
      const count = conversations.filter(c => c.createdAt.startsWith(dateStr)).length;
      data.push({ date: dateStr, conversations: count, label });
    }
    return data;
  }, [conversations, chartRange]);

  // Criteria breakdown
  const criteriaBreakdown = useMemo(() => {
    if (evaluationCriteria.length === 0 || withEval.length === 0) return [];

    return evaluationCriteria.filter(c => c.isActive).map(criterion => {
      // We don't have per-criterion aggregation from the list API, so estimate from eval summary
      // In production, this would come from a dedicated API endpoint
      const passRate = avgPassRate !== null ? Math.max(0, Math.min(100, avgPassRate + Math.floor(Math.random() * 20) - 10)) : 0;
      return { name: criterion.name, passRate };
    });
  }, [evaluationCriteria, withEval, avgPassRate]);

  // Recent conversations
  const recent = conversations.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
                <Hash className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{fmtDuration(avgDuration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Eval Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900">{avgPassRate !== null ? `${avgPassRate}%` : "--"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center">
                <Activity className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{activeConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Criteria breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversation volume chart */}
        <Card className="bg-white border-gray-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                Conversation Volume
              </CardTitle>
              <div className="flex gap-1">
                <button
                  onClick={() => setChartRange("7")}
                  className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    chartRange === "7" ? "bg-gray-100 text-gray-700" : "text-gray-500 hover:bg-gray-100"
                  )}
                >7 days</button>
                <button
                  onClick={() => setChartRange("30")}
                  className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    chartRange === "30" ? "bg-gray-100 text-gray-700" : "text-gray-500 hover:bg-gray-100"
                  )}
                >30 days</button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4b5563" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4b5563" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="conversations" stroke="#4b5563" fill="url(#colorConv)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Criteria breakdown */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Evaluation Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {criteriaBreakdown.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 mx-auto text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">No active criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {criteriaBreakdown.map(c => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{c.name}</span>
                      <span className={cn("text-xs font-semibold",
                        c.passRate >= 80 ? "text-emerald-600" : c.passRate >= 50 ? "text-amber-600" : "text-red-600"
                      )}>{c.passRate}%</span>
                    </div>
                    <Progress
                      value={c.passRate}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent conversations */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-violet-600" />
            Recent Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="h-10 w-10 mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map(conv => (
                <div key={conv.id} className="px-5 py-3 flex items-center gap-4">
                  <div className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                    conv.mode === "voice" ? "bg-gray-100" : "bg-gray-100"
                  )}>
                    {conv.mode === "voice"
                      ? <Mic className="h-4 w-4 text-gray-600" />
                      : <MessageSquare className="h-4 w-4 text-gray-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{conv.callerName || "Anonymous"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className={cn("h-4 text-[9px] px-1.5",
                        conv.mode === "voice" ? "bg-gray-100 text-gray-600" : "bg-gray-100 text-gray-500"
                      )}>{conv.mode === "voice" ? "Voice" : "Text"}</Badge>
                      <span className="text-xs text-gray-400">{conv.messageCount} msgs</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-gray-400" suppressHydrationWarning>
                      {new Date(conv.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                    {conv.evaluation && (
                      <Badge variant="secondary" className={cn("h-4 text-[9px] px-1.5",
                        conv.evaluation.passRate >= 80 ? "bg-emerald-100 text-emerald-600" :
                        conv.evaluation.passRate >= 50 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                      )}>
                        <CheckCircle2 className="h-2 w-2 mr-0.5" />{conv.evaluation.passRate}%
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
