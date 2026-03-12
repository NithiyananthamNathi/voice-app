"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConversationIntelligence, PersonaArchetype, PrimaryIntent } from "@/lib/store";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  LightbulbIcon,
  Download,
  Filter,
  Calendar,
  Users,
  Target,
  Activity,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ConversationWithIntelligence {
  id: string;
  createdAt: string;
  intelligence: ConversationIntelligence | null;
}

interface IntelligenceTrendsProps {
  conversations: ConversationWithIntelligence[];
}

export function IntelligenceTrends({ conversations }: IntelligenceTrendsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d" | "90d">("30d");
  const [personaFilter, setPersonaFilter] = useState<PersonaArchetype | "all">("all");
  const [intentFilter, setIntentFilter] = useState<PrimaryIntent | "all">("all");

  // Filter conversations
  const withIntelligence = conversations.filter(c => c.intelligence != null);

  const { filteredConversations, timeSeriesData, insights, trends } = useMemo(() => {
    // Apply time range filter
    const days = timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date(new Date().getTime() - days * 86400000);
    
    let filtered = withIntelligence.filter(c => new Date(c.createdAt) >= cutoff);

    // Apply persona filter
    if (personaFilter !== "all") {
      filtered = filtered.filter(c => c.intelligence?.personaArchetype === personaFilter);
    }

    // Apply intent filter
    if (intentFilter !== "all") {
      filtered = filtered.filter(c => c.intelligence?.primaryIntent === intentFilter);
    }

    // Generate time series data
    const timeData = generateTimeSeriesData(filtered, days);
    
    // Generate AI insights
    const aiInsights = generateInsights(filtered);
    
    // Calculate trends
    const trendData = calculateTrends(filtered);

    return {
      filteredConversations: filtered,
      timeSeriesData: timeData,
      insights: aiInsights,
      trends: trendData,
    };
  }, [withIntelligence, timeRange, personaFilter, intentFilter]);

  if (withIntelligence.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No Intelligence Data
        </h3>
        <p className="text-sm text-slate-500">
          Complete some conversations to see trends and insights
        </p>
      </Card>
    );
  }

  // Get unique values for filters
  const uniquePersonas = Array.from(
    new Set(withIntelligence.map(c => c.intelligence?.personaArchetype).filter(Boolean))
  ) as PersonaArchetype[];

  const uniqueIntents = Array.from(
    new Set(withIntelligence.map(c => c.intelligence?.primaryIntent).filter(Boolean))
  ) as PrimaryIntent[];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Filters & Export */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>

            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
              <SelectTrigger className="w-[140px] h-9 bg-white">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={personaFilter} onValueChange={(v) => setPersonaFilter(v as typeof personaFilter)}>
              <SelectTrigger className="w-[180px] h-9 bg-white">
                <Users className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Personas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Personas</SelectItem>
                {uniquePersonas.map(p => (
                  <SelectItem key={p} value={p}>{formatPersona(p)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={intentFilter} onValueChange={(v) => setIntentFilter(v as typeof intentFilter)}>
              <SelectTrigger className="w-[200px] h-9 bg-white">
                <Target className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Intents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intents</SelectItem>
                {uniqueIntents.map(i => (
                  <SelectItem key={i} value={i}>{formatIntent(i)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="secondary" className="ml-auto">
              {filteredConversations.length} conversations
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(filteredConversations)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </Card>

        {/* AI Insights */}
        {insights.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <LightbulbIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">AI-Generated Insights</h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === "positive"
                      ? "bg-emerald-50 border-emerald-500"
                      : insight.type === "warning"
                      ? "bg-amber-50 border-amber-500"
                      : "bg-blue-50 border-blue-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {insight.type === "positive" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    ) : insight.type === "warning" ? (
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    ) : (
                      <LightbulbIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{insight.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                      {insight.recommendation && (
                        <p className="text-xs text-slate-500 mt-2 italic">
                          💡 {insight.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Trend Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TrendCard
            label="Success Rate"
            value={`${trends.successRate.current}%`}
            change={trends.successRate.change}
            changePercent={trends.successRate.changePercent}
            icon={<Activity className="w-5 h-5" />}
            color="emerald"
          />
          <TrendCard
            label="High Trust"
            value={`${trends.trustRate.current}%`}
            change={trends.trustRate.change}
            changePercent={trends.trustRate.changePercent}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="green"
          />
          <TrendCard
            label="Deep Engagement"
            value={`${trends.engagementRate.current}%`}
            change={trends.engagementRate.change}
            changePercent={trends.engagementRate.changePercent}
            icon={<Sparkles className="w-5 h-5" />}
            color="violet"
          />
          <TrendCard
            label="Advanced Literacy"
            value={`${trends.literacyRate.current}%`}
            change={trends.literacyRate.change}
            changePercent={trends.literacyRate.changePercent}
            icon={<TrendingUp className="w-5 h-5" />}
            color="indigo"
          />
        </div>

        {/* Time Series Charts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Success Rate Over Time
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number | undefined) => value !== undefined ? [`${value}%`, "Success Rate"] : ["N/A", "Success Rate"]}
                />
                <Area
                  type="monotone"
                  dataKey="successRate"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#successGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trust Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Trust Level Trends
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="highTrust"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="High Trust"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lowTrust"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Low Trust"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Engagement Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Engagement Depth Trends
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="deepEngagement"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Deep/Vulnerable"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="surfaceEngagement"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    name="Surface"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────────

interface TrendCardProps {
  label: string;
  value: string;
  change: number;
  changePercent: number;
  icon: React.ReactNode;
  color: string;
}

const trendColorMap: Record<string, { bg: string; text: string }> = {
  emerald:{ bg: "bg-emerald-100", text: "text-emerald-600" },
  green:  { bg: "bg-green-100",   text: "text-green-600" },
  violet: { bg: "bg-violet-100",  text: "text-violet-600" },
  indigo: { bg: "bg-indigo-100",  text: "text-indigo-600" },
};

function TrendCard({ label, value, change, changePercent, icon, color }: TrendCardProps) {
  const isPositive = change >= 0;
  const colors = trendColorMap[color] ?? trendColorMap.emerald;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <div className={colors.text}>{icon}</div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isPositive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(changePercent)}%
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              {isPositive ? "+" : ""}{change} points vs previous period
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
    </Card>
  );
}

// ── Data Processing Functions ──────────────────────────────────────────────────

function generateTimeSeriesData(conversations: ConversationWithIntelligence[], days: number) {
  const data: Array<{
    date: string;
    successRate: number;
    highTrust: number;
    lowTrust: number;
    deepEngagement: number;
    surfaceEngagement: number;
    count: number;
  }> = [];

  // Group by date
  const grouped = new Map<string, ConversationWithIntelligence[]>();
  const startDate = new Date(Date.now() - days * 86400000);

  // Initialize all dates
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    grouped.set(dateStr, []);
  }

  // Group conversations by date
  conversations.forEach(c => {
    const dateStr = c.createdAt.split("T")[0];
    if (grouped.has(dateStr)) {
      grouped.get(dateStr)!.push(c);
    }
  });

  // Calculate metrics for each date
  grouped.forEach((convs, dateStr) => {
    if (convs.length === 0) {
      data.push({
        date: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        successRate: 0,
        highTrust: 0,
        lowTrust: 0,
        deepEngagement: 0,
        surfaceEngagement: 0,
        count: 0,
      });
      return;
    }

    const intelligences = convs.map(c => c.intelligence!);
    
    const successCount = intelligences.filter(i =>
      ["CALM_CURIOUS", "HOPEFUL"].includes(i.emotionalStateEnd)
    ).length;

    const highTrustCount = intelligences.filter(i => i.trustSignal === "high").length;
    const lowTrustCount = intelligences.filter(i =>
      ["low", "active_distrust"].includes(i.trustSignal)
    ).length;

    const deepEngagementCount = intelligences.filter(i =>
      ["deep", "vulnerable"].includes(i.engagementDepth)
    ).length;
    const surfaceEngagementCount = intelligences.filter(i => i.engagementDepth === "surface").length;

    data.push({
      date: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      successRate: Math.round((successCount / convs.length) * 100),
      highTrust: Math.round((highTrustCount / convs.length) * 100),
      lowTrust: Math.round((lowTrustCount / convs.length) * 100),
      deepEngagement: Math.round((deepEngagementCount / convs.length) * 100),
      surfaceEngagement: Math.round((surfaceEngagementCount / convs.length) * 100),
      count: convs.length,
    });
  });

  return data;
}

function calculateTrends(
  conversations: ConversationWithIntelligence[]
) {
  const midpoint = Math.floor(conversations.length / 2);
  const firstHalf = conversations.slice(0, midpoint);
  const secondHalf = conversations.slice(midpoint);

  const calcRate = (convs: ConversationWithIntelligence[], metric: string) => {
    if (convs.length === 0) return 0;
    const intelligences = convs.map(c => c.intelligence!);
    
    if (metric === "success") {
      return Math.round(
        (intelligences.filter(i => ["CALM_CURIOUS", "HOPEFUL"].includes(i.emotionalStateEnd)).length /
          convs.length) *
          100
      );
    } else if (metric === "trust") {
      return Math.round(
        (intelligences.filter(i => i.trustSignal === "high").length / convs.length) * 100
      );
    } else if (metric === "engagement") {
      return Math.round(
        (intelligences.filter(i => ["deep", "vulnerable"].includes(i.engagementDepth)).length /
          convs.length) *
          100
      );
    } else if (metric === "literacy") {
      return Math.round(
        (intelligences.filter(i => i.healthLiteracy === "advanced").length / convs.length) * 100
      );
    }
    return 0;
  };

  const prev = {
    success: calcRate(firstHalf, "success"),
    trust: calcRate(firstHalf, "trust"),
    engagement: calcRate(firstHalf, "engagement"),
    literacy: calcRate(firstHalf, "literacy"),
  };

  const curr = {
    success: calcRate(secondHalf, "success"),
    trust: calcRate(secondHalf, "trust"),
    engagement: calcRate(secondHalf, "engagement"),
    literacy: calcRate(secondHalf, "literacy"),
  };

  return {
    successRate: {
      current: curr.success,
      change: curr.success - prev.success,
      changePercent: prev.success > 0 ? Math.round(((curr.success - prev.success) / prev.success) * 100) : 0,
    },
    trustRate: {
      current: curr.trust,
      change: curr.trust - prev.trust,
      changePercent: prev.trust > 0 ? Math.round(((curr.trust - prev.trust) / prev.trust) * 100) : 0,
    },
    engagementRate: {
      current: curr.engagement,
      change: curr.engagement - prev.engagement,
      changePercent: prev.engagement > 0 ? Math.round(((curr.engagement - prev.engagement) / prev.engagement) * 100) : 0,
    },
    literacyRate: {
      current: curr.literacy,
      change: curr.literacy - prev.literacy,
      changePercent: prev.literacy > 0 ? Math.round(((curr.literacy - prev.literacy) / prev.literacy) * 100) : 0,
    },
  };
}

interface Insight {
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
  recommendation?: string;
}

function generateInsights(conversations: ConversationWithIntelligence[]): Insight[] {
  if (conversations.length === 0) return [];

  const insights: Insight[] = [];
  const intelligences = conversations.map(c => c.intelligence!);

  // Success rate insight
  const successCount = intelligences.filter(i =>
    ["CALM_CURIOUS", "HOPEFUL"].includes(i.emotionalStateEnd)
  ).length;
  const successRate = (successCount / intelligences.length) * 100;

  if (successRate >= 80) {
    insights.push({
      type: "positive",
      title: "Excellent Emotional Support",
      description: `${Math.round(successRate)}% of conversations achieved positive emotional outcomes (calm or hopeful states).`,
      recommendation: "Maintain current conversation strategies - they're highly effective.",
    });
  } else if (successRate < 50) {
    insights.push({
      type: "warning",
      title: "Low Success Rate",
      description: `Only ${Math.round(successRate)}% of conversations achieved positive emotional outcomes.`,
      recommendation: "Review conversation patterns for anxious/frustrated users. Consider adding more empathetic responses.",
    });
  }

  // Trust insights
  const highTrustCount = intelligences.filter(i => i.trustSignal === "high").length;
  const lowTrustCount = intelligences.filter(i =>
    ["low", "active_distrust"].includes(i.trustSignal)
  ).length;

  if (lowTrustCount > intelligences.length * 0.2) {
    insights.push({
      type: "warning",
      title: "Trust Issues Detected",
      description: `${Math.round((lowTrustCount / intelligences.length) * 100)}% of users expressed low trust or active distrust.`,
      recommendation: "Add credibility signals, citations, and transparent disclaimers to build trust.",
    });
  } else if (highTrustCount > intelligences.length * 0.6) {
    insights.push({
      type: "positive",
      title: "High User Trust",
      description: `${Math.round((highTrustCount / intelligences.length) * 100)}% of users expressed high trust in the AI.`,
    });
  }

  // Persona distribution insight
  const personaCounts = new Map<string, number>();
  intelligences.forEach(i => {
    personaCounts.set(i.personaArchetype, (personaCounts.get(i.personaArchetype) || 0) + 1);
  });

  const topPersona = Array.from(personaCounts.entries()).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  if (topPersona[1] > intelligences.length * 0.4) {
    insights.push({
      type: "info",
      title: "Dominant Persona Type",
      description: `${formatPersona(topPersona[0])} represents ${Math.round((topPersona[1] / intelligences.length) * 100)}% of your users.`,
      recommendation: `Optimize content and tone specifically for ${formatPersona(topPersona[0])} needs.`,
    });
  }

  // Intent insights
  const emotionalSupportCount = intelligences.filter(i =>
    i.primaryIntent === "EMOTIONAL_SUPPORT"
  ).length;

  if (emotionalSupportCount > intelligences.length * 0.3) {
    insights.push({
      type: "info",
      title: "High Need for Emotional Support",
      description: `${Math.round((emotionalSupportCount / intelligences.length) * 100)}% of users primarily need emotional support.`,
      recommendation: "Prioritize empathetic, reassuring language in your responses.",
    });
  }

  // Literacy insight
  const beginnerCount = intelligences.filter(i => i.healthLiteracy === "beginner").length;
  if (beginnerCount > intelligences.length * 0.5) {
    insights.push({
      type: "warning",
      title: "Low Health Literacy",
      description: `${Math.round((beginnerCount / intelligences.length) * 100)}% of users have beginner-level health literacy.`,
      recommendation: "Simplify medical terminology and add more explanations for complex concepts.",
    });
  }

  return insights;
}

function exportToCSV(conversations: ConversationWithIntelligence[]) {
  // CSV headers
  const headers = [
    "Date",
    "Persona",
    "Primary Intent",
    "Secondary Intent",
    "Emotional Start",
    "Emotional End",
    "Innate Desire",
    "Health Literacy",
    "Readiness to Act",
    "Trust Signal",
    "Engagement Depth",
  ];

  // CSV rows
  const rows = conversations.map(c => {
    const i = c.intelligence!;
    return [
      new Date(c.createdAt).toLocaleDateString(),
      formatPersona(i.personaArchetype),
      formatIntent(i.primaryIntent),
      i.secondaryIntent ? formatIntent(i.secondaryIntent) : "N/A",
      formatValue(i.emotionalStateStart),
      formatValue(i.emotionalStateEnd),
      formatValue(i.innateDesire),
      i.healthLiteracy,
      formatValue(i.readinessToAct),
      i.trustSignal,
      i.engagementDepth,
    ];
  });

  // Generate CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
  ].join("\n");

  // Download
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `intelligence-export-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Formatting Functions ───────────────────────────────────────────────────────

function formatPersona(persona: string): string {
  return persona
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatIntent(intent: string): string {
  return intent
    .split("_")
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatValue(value: string): string {
  return value
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
