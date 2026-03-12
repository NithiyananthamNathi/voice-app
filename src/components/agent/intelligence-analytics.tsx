"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConversationIntelligence, PersonaArchetype, PrimaryIntent, EmotionalState } from "@/lib/store";
import {
  Users,
  Target,
  TrendingUp,
  Heart,
  Shield,
  Brain,
  Activity,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

interface ConversationWithIntelligence {
  id: string;
  createdAt: string;
  intelligence: ConversationIntelligence | null;
}

interface IntelligenceAnalyticsProps {
  conversations: ConversationWithIntelligence[];
}

export function IntelligenceAnalytics({ conversations }: IntelligenceAnalyticsProps) {
  // Filter conversations with intelligence
  const withIntelligence = conversations.filter(c => c.intelligence != null && !!(c.intelligence as ConversationIntelligence).personaArchetype);
  
  if (withIntelligence.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-slate-50 to-blue-50/30">
        <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No Intelligence Data Yet
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Intelligence is generated when conversations end. Complete some conversations
          to see AI-powered insights and patterns.
        </p>
      </Card>
    );
  }

  // Calculate metrics
  const metrics = calculateMetrics(withIntelligence);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Sparkles className="w-5 h-5" />}
            label="Total Analyzed"
            value={withIntelligence.length}
            color="blue"
            tooltip="Conversations with AI intelligence generated"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Success Rate"
            value={`${metrics.emotionalArcSuccessRate}%`}
            color={metrics.emotionalArcSuccessRate >= 70 ? "emerald" : "amber"}
            tooltip="Percentage of conversations with positive emotional outcomes"
          />
          <StatCard
            icon={<Shield className="w-5 h-5" />}
            label="High Trust"
            value={`${metrics.highTrustRate}%`}
            color={metrics.highTrustRate >= 50 ? "emerald" : "amber"}
            tooltip="Percentage of conversations where users expressed high trust"
          />
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            label="Deep Engagement"
            value={`${metrics.deepEngagementRate}%`}
            color="violet"
            tooltip="Percentage of conversations with deep or vulnerable engagement"
          />
        </div>

        {/* Persona Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Persona Distribution</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Who your users are behaviorally - their relationship with their condition
                  and information-seeking style
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-3">
            {metrics.personaDistribution.map(({ persona, count, percentage }) => (
              <div key={persona} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {formatPersona(persona)}
                  </span>
                  <span className="text-slate-500">
                    {count} ({percentage}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Intent Analysis */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-900">Top User Intents</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  What users are asking for beneath their words - the underlying needs
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metrics.intentDistribution.slice(0, 8).map(({ intent, count, percentage }) => (
              <div
                key={intent}
                className="p-3 rounded-lg bg-gradient-to-br from-slate-50 to-purple-50/30 border border-slate-200"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">
                    {formatIntent(intent)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {percentage}%
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">{count} conversations</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Emotional Arc Analysis */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-slate-900">Emotional Arc Outcomes</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  How emotional states evolved - measures AI effectiveness in supporting users
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Improved</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {metrics.emotionalArcImproved}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                {Math.round((metrics.emotionalArcImproved / withIntelligence.length) * 100)}%
                of conversations
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-900">Stable</span>
              </div>
              <p className="text-2xl font-bold text-slate-600">
                {metrics.emotionalArcStable}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {Math.round((metrics.emotionalArcStable / withIntelligence.length) * 100)}%
                of conversations
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">Worsened</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {metrics.emotionalArcWorsened}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {Math.round((metrics.emotionalArcWorsened / withIntelligence.length) * 100)}%
                of conversations
              </p>
            </div>
          </div>
        </Card>

        {/* Trust & Engagement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trust Levels */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-900">Trust Levels</h3>
            </div>
            <div className="space-y-3">
              {metrics.trustDistribution.map(({ level, count, percentage }) => (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 capitalize">
                      {level.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${getTrustProgressColor(level)}`}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Engagement Depth */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-semibold text-slate-900">Engagement Depth</h3>
            </div>
            <div className="space-y-3">
              {metrics.engagementDistribution.map(({ level, count, percentage }) => (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 capitalize">
                      {level}
                    </span>
                    <span className="text-slate-500">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Health Literacy & Readiness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Literacy */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900">Health Literacy Levels</h3>
            </div>
            <div className="space-y-3">
              {metrics.literacyDistribution.map(({ level, count, percentage }) => (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 capitalize">
                      {level}
                    </span>
                    <span className="text-slate-500">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          {/* Readiness to Act */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-slate-900">Readiness to Act</h3>
            </div>
            <div className="space-y-3">
              {metrics.readinessDistribution.map(({ stage, count, percentage }) => (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {formatReadiness(stage)}
                    </span>
                    <span className="text-slate-500">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Innate Desires */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-slate-900">Innate Desires</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  What users actually need beneath their questions - the emotional drivers
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metrics.desireDistribution.map(({ desire, count, percentage }) => (
              <div
                key={desire}
                className="p-3 rounded-lg bg-gradient-to-br from-slate-50 to-pink-50/30 border border-slate-200 text-center"
              >
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {formatDesire(desire)}
                </p>
                <p className="text-2xl font-bold text-pink-600">{count}</p>
                <p className="text-xs text-slate-500 mt-1">{percentage}%</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  tooltip: string;
}

const statColorMap: Record<string, { bg: string; text: string }> = {
  blue:   { bg: "bg-blue-100",   text: "text-blue-600" },
  emerald:{ bg: "bg-emerald-100",text: "text-emerald-600" },
  amber:  { bg: "bg-amber-100",  text: "text-amber-600" },
  violet: { bg: "bg-violet-100", text: "text-violet-600" },
};

function StatCard({ icon, label, value, color, tooltip }: StatCardProps) {
  const colors = statColorMap[color] ?? statColorMap.blue;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="p-4 hover:shadow-md transition-shadow cursor-help">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colors.bg}`}>
              <div className={colors.text}>{icon}</div>
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
            </div>
          </div>
        </Card>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm max-w-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// ── Metrics Calculation ────────────────────────────────────────────────────────

function calculateMetrics(conversations: ConversationWithIntelligence[]) {
  const intelligences = conversations
    .map(c => c.intelligence)
    .filter((i): i is ConversationIntelligence => i != null && !!i.personaArchetype);

  // Persona distribution
  const personaCounts = new Map<PersonaArchetype, number>();
  intelligences.forEach(i => {
    personaCounts.set(i.personaArchetype, (personaCounts.get(i.personaArchetype) || 0) + 1);
  });

  const personaDistribution = Array.from(personaCounts.entries())
    .map(([persona, count]) => ({
      persona,
      count,
      percentage: Math.round((count / intelligences.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Intent distribution
  const intentCounts = new Map<PrimaryIntent, number>();
  intelligences.forEach(i => {
    intentCounts.set(i.primaryIntent, (intentCounts.get(i.primaryIntent) || 0) + 1);
  });

  const intentDistribution = Array.from(intentCounts.entries())
    .map(([intent, count]) => ({
      intent,
      count,
      percentage: Math.round((count / intelligences.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Emotional arc analysis
  const positiveEndStates: EmotionalState[] = ['CALM_CURIOUS', 'HOPEFUL'];
  const negativeStartStates: EmotionalState[] = ['MILDLY_ANXIOUS', 'HIGHLY_ANXIOUS', 'FRUSTRATED', 'OVERWHELMED', 'DEFEATED', 'URGENT'];
  
  let emotionalArcImproved = 0;
  let emotionalArcStable = 0;
  let emotionalArcWorsened = 0;

  intelligences.forEach(i => {
    const startNegative = negativeStartStates.includes(i.emotionalStateStart);
    const endPositive = positiveEndStates.includes(i.emotionalStateEnd);
    const endNegative = negativeStartStates.includes(i.emotionalStateEnd);

    if (startNegative && endPositive) {
      emotionalArcImproved++;
    } else if (startNegative && endNegative) {
      // Check if it got worse
      const startIndex = negativeStartStates.indexOf(i.emotionalStateStart);
      const endIndex = negativeStartStates.indexOf(i.emotionalStateEnd);
      if (endIndex < startIndex) {
        emotionalArcWorsened++;
      } else {
        emotionalArcStable++;
      }
    } else if (i.emotionalStateStart === i.emotionalStateEnd) {
      emotionalArcStable++;
    } else {
      emotionalArcStable++;
    }
  });

  const emotionalArcSuccessRate = Math.round(
    (emotionalArcImproved / intelligences.length) * 100
  );

  // Trust distribution
  const trustCounts = new Map<string, number>();
  intelligences.forEach(i => {
    trustCounts.set(i.trustSignal, (trustCounts.get(i.trustSignal) || 0) + 1);
  });

  const trustDistribution = Array.from(trustCounts.entries())
    .map(([level, count]) => ({
      level,
      count,
      percentage: Math.round((count / intelligences.length) * 100),
    }))
    .sort((a, b) => {
      const order = ['high', 'neutral', 'low', 'active_distrust'];
      return order.indexOf(a.level) - order.indexOf(b.level);
    });

  const highTrustRate = Math.round(
    ((trustCounts.get('high') || 0) / intelligences.length) * 100
  );

  // Engagement distribution
  const engagementCounts = new Map<string, number>();
  intelligences.forEach(i => {
    engagementCounts.set(i.engagementDepth, (engagementCounts.get(i.engagementDepth) || 0) + 1);
  });

  const engagementDistribution = Array.from(engagementCounts.entries())
    .map(([level, count]) => ({
      level,
      count,
      percentage: Math.round((count / intelligences.length) * 100),
    }))
    .sort((a, b) => {
      const order = ['vulnerable', 'deep', 'moderate', 'surface'];
      return order.indexOf(a.level) - order.indexOf(b.level);
    });

  const deepEngagementRate = Math.round(
    (((engagementCounts.get('deep') || 0) + (engagementCounts.get('vulnerable') || 0)) / 
      intelligences.length) * 100
  );

  // Literacy distribution
  const literacyCounts = new Map<string, number>();
  intelligences.forEach(i => {
    literacyCounts.set(i.healthLiteracy, (literacyCounts.get(i.healthLiteracy) || 0) + 1);
  });

  const literacyDistribution = Array.from(literacyCounts.entries())
    .map(([level, count]) => ({
      level,
      count,
      percentage: Math.round((count / intelligences.length) * 100),
    }))
    .sort((a, b) => {
      const order = ['beginner', 'intermediate', 'advanced'];
      return order.indexOf(a.level) - order.indexOf(b.level);
    });

  // Readiness distribution
  const readinessCounts = new Map<string, number>();
  intelligences.forEach(i => {
    readinessCounts.set(i.readinessToAct, (readinessCounts.get(i.readinessToAct) || 0) + 1);
  });

  const readinessDistribution = Array.from(readinessCounts.entries())
    .map(([stage, count]) => ({
      stage,
      count,
      percentage: Math.round((count / intelligences.length) * 100),
    }))
    .sort((a, b) => {
      const order = ['pre_contemplation', 'contemplation', 'preparation', 'action', 'maintenance'];
      return order.indexOf(a.stage) - order.indexOf(b.stage);
    });

  // Desire distribution
  const desireCounts = new Map<string, number>();
  intelligences.forEach(i => {
    desireCounts.set(i.innateDesire, (desireCounts.get(i.innateDesire) || 0) + 1);
  });

  const desireDistribution = Array.from(desireCounts.entries())
    .map(([desire, count]) => ({
      desire,
      count,
      percentage: Math.round((count / intelligences.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    personaDistribution,
    intentDistribution,
    emotionalArcImproved,
    emotionalArcStable,
    emotionalArcWorsened,
    emotionalArcSuccessRate,
    trustDistribution,
    highTrustRate,
    engagementDistribution,
    deepEngagementRate,
    literacyDistribution,
    readinessDistribution,
    desireDistribution,
  };
}

// ── Formatting Functions ───────────────────────────────────────────────────────

function formatPersona(persona: string): string {
  return persona
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatIntent(intent: string): string {
  return intent
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

function formatDesire(desire: string): string {
  return desire
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

function formatReadiness(readiness: string): string {
  return readiness
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getTrustProgressColor(level: string): string {
  const colors: Record<string, string> = {
    high: '[&>div]:bg-emerald-500',
    neutral: '[&>div]:bg-slate-400',
    low: '[&>div]:bg-amber-500',
    active_distrust: '[&>div]:bg-red-500',
  };
  return colors[level] || '';
}
