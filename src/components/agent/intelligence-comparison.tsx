"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  Users,
  Target,
  Heart,
  BookOpen,
  Shield,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle,
} from "lucide-react";
import type { ConversationIntelligence, PersonaArchetype, PrimaryIntent } from "@/lib/store";

interface ConversationWithIntelligence {
  id: string;
  agentId: string;
  agentName: string;
  createdAt: string;
  intelligence: ConversationIntelligence;
}

interface AgentStats {
  agentId: string;
  agentName: string;
  totalConversations: number;
  successRate: number;
  topPersona: PersonaArchetype;
  topIntent: PrimaryIntent;
  highTrustRate: number;
  deepEngagementRate: number;
  advancedLiteracyRate: number;
  avgEmotionalImprovement: number;
}

interface IntelligenceComparisonProps {
  conversations: ConversationWithIntelligence[];
}

export function IntelligenceComparison({ conversations }: IntelligenceComparisonProps) {
  const [sortBy, setSortBy] = useState<keyof AgentStats>("successRate");

  const agentStats: AgentStats[] = useMemo(() => {
    // Group by agent
    const grouped = new Map<string, ConversationWithIntelligence[]>();
    conversations.forEach((conv) => {
      if (!grouped.has(conv.agentId)) {
        grouped.set(conv.agentId, []);
      }
      grouped.get(conv.agentId)!.push(conv);
    });

    // Calculate stats for each agent
    const stats: AgentStats[] = [];
    grouped.forEach((convs, agentId) => {
      const intelligences = convs.map((c) => c.intelligence).filter((i): i is ConversationIntelligence => i != null);
      
      // Success rate (positive emotional outcomes)
      const successCount = intelligences.filter((i) =>
        ["CALM_CURIOUS", "HOPEFUL"].includes(i.emotionalStateEnd)
      ).length;
      const successRate = Math.round((successCount / convs.length) * 100);

      // Top persona
      const personaCounts = new Map<PersonaArchetype, number>();
      intelligences.forEach((i) => {
        personaCounts.set(i.personaArchetype, (personaCounts.get(i.personaArchetype) || 0) + 1);
      });
      const topPersona = Array.from(personaCounts.entries()).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0];

      // Top intent
      const intentCounts = new Map<PrimaryIntent, number>();
      intelligences.forEach((i) => {
        intentCounts.set(i.primaryIntent, (intentCounts.get(i.primaryIntent) || 0) + 1);
      });
      const topIntent = Array.from(intentCounts.entries()).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0];

      // High trust rate
      const highTrustCount = intelligences.filter((i) => i.trustSignal === "high").length;
      const highTrustRate = Math.round((highTrustCount / convs.length) * 100);

      // Deep engagement rate
      const deepEngagementCount = intelligences.filter((i) =>
        ["deep", "vulnerable"].includes(i.engagementDepth)
      ).length;
      const deepEngagementRate = Math.round((deepEngagementCount / convs.length) * 100);

      // Advanced literacy rate
      const advancedLiteracyCount = intelligences.filter(
        (i) => i.healthLiteracy === "advanced"
      ).length;
      const advancedLiteracyRate = Math.round((advancedLiteracyCount / convs.length) * 100);

      // Average emotional improvement (simplified scoring)
      const emotionalScores = intelligences.map((i) => {
        const startScore = getEmotionalScore(i.emotionalStateStart);
        const endScore = getEmotionalScore(i.emotionalStateEnd);
        return endScore - startScore;
      });
      const avgEmotionalImprovement =
        Math.round((emotionalScores.reduce((a, b) => a + b, 0) / convs.length) * 10) / 10;

      stats.push({
        agentId,
        agentName: convs[0].agentName,
        totalConversations: convs.length,
        successRate,
        topPersona,
        topIntent,
        highTrustRate,
        deepEngagementRate,
        advancedLiteracyRate,
        avgEmotionalImprovement,
      });
    });

    // Sort
    return stats.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return bVal - aVal;
      }
      return String(bVal).localeCompare(String(aVal));
    });
  }, [conversations, sortBy]);

  if (agentStats.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="h-5 w-5" />
            <p>No agents with intelligence data to compare.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900">Agent Intelligence Comparison</h3>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {agentStats.length} agents
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Sort by:</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as keyof AgentStats)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="successRate">Success Rate</SelectItem>
              <SelectItem value="highTrustRate">Trust Rate</SelectItem>
              <SelectItem value="deepEngagementRate">Engagement Depth</SelectItem>
              <SelectItem value="advancedLiteracyRate">Literacy Level</SelectItem>
              <SelectItem value="totalConversations">Conversations</SelectItem>
              <SelectItem value="avgEmotionalImprovement">Emotional Improvement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison table */}
      <div className="space-y-3">
        {agentStats.map((agent, idx) => (
          <Card
            key={agent.agentId}
            className={`border-slate-200 transition-all hover:shadow-md ${
              idx === 0 ? "border-2 border-purple-300 bg-purple-50/30" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{agent.agentName}</h4>
                    {idx === 0 && (
                      <Badge className="bg-purple-600 text-white text-[10px] px-1.5 py-0">
                        Top
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {agent.totalConversations} conversations analyzed
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-2xl font-bold text-slate-900">{agent.successRate}%</span>
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Success Rate</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* Top Persona */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                      Top Persona
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {formatPersona(agent.topPersona)}
                  </p>
                </div>

                {/* Top Intent */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-violet-600" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                      Top Intent
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {formatIntent(agent.topIntent)}
                  </p>
                </div>

                {/* Trust Rate */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Trust</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={agent.highTrustRate} className="h-1.5 flex-1" />
                    <span className="text-xs font-semibold text-slate-700">
                      {agent.highTrustRate}%
                    </span>
                  </div>
                </div>

                {/* Engagement Depth */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                      Engagement
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={agent.deepEngagementRate} className="h-1.5 flex-1" />
                    <span className="text-xs font-semibold text-slate-700">
                      {agent.deepEngagementRate}%
                    </span>
                  </div>
                </div>

                {/* Health Literacy */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                      Literacy
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={agent.advancedLiteracyRate} className="h-1.5 flex-1" />
                    <span className="text-xs font-semibold text-slate-700">
                      {agent.advancedLiteracyRate}%
                    </span>
                  </div>
                </div>

                {/* Emotional Improvement */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-600" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                      Emotional
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {agent.avgEmotionalImprovement > 0.5 ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                    ) : agent.avgEmotionalImprovement < -0.5 ? (
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                    ) : (
                      <Minus className="h-3 w-3 text-gray-400" />
                    )}
                    <span
                      className={`text-xs font-semibold ${
                        agent.avgEmotionalImprovement > 0.5
                          ? "text-emerald-600"
                          : agent.avgEmotionalImprovement < -0.5
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {agent.avgEmotionalImprovement > 0 ? "+" : ""}
                      {agent.avgEmotionalImprovement.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Helper functions
function getEmotionalScore(state: string): number {
  const scores: Record<string, number> = {
    HIGHLY_ANXIOUS: -2,
    MILDLY_ANXIOUS: -1,
    FRUSTRATED: -1.5,
    SKEPTICAL: -0.5,
    NEUTRAL: 0,
    CALM_CURIOUS: 1,
    HOPEFUL: 2,
  };
  return scores[state] || 0;
}

function formatPersona(persona: PersonaArchetype): string {
  return persona
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatIntent(intent: PrimaryIntent): string {
  return intent
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
