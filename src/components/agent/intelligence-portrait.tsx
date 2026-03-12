"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConversationIntelligence } from "@/lib/store";
import {
  User,
  Target,
  Heart,
  TrendingUp,
  Shield,
  Brain,
  Activity,
  Sparkles,
  Info,
} from "lucide-react";

interface IntelligencePortraitProps {
  intelligence: ConversationIntelligence;
  variant?: "full" | "compact";
}

export function IntelligencePortrait({
  intelligence,
  variant = "full",
}: IntelligencePortraitProps) {
  if (variant === "compact") {
    return <CompactPortrait intelligence={intelligence} />;
  }

  return (
    <TooltipProvider>
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Conversation Intelligence Portrait
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-slate-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                AI-generated psychological and behavioral analysis extracted from
                conversation patterns, tone, and content.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Persona Archetype */}
          <DimensionCard
            icon={<User className="w-4 h-4" />}
            label="Persona"
            value={formatPersona(intelligence.personaArchetype)}
            color={getPersonaColor(intelligence.personaArchetype)}
            tooltip="Who the user is behaviorally - their relationship with their condition and information-seeking style"
          />

          {/* Primary Intent */}
          <DimensionCard
            icon={<Target className="w-4 h-4" />}
            label="Primary Intent"
            value={formatIntent(intelligence.primaryIntent)}
            color="blue"
            tooltip="What the user is asking for beneath their words"
          />

          {/* Secondary Intent */}
          {intelligence.secondaryIntent && (
            <DimensionCard
              icon={<Target className="w-4 h-4" />}
              label="Secondary Intent"
              value={formatIntent(intelligence.secondaryIntent)}
              color="indigo"
              tooltip="Contextual modifier that adds depth to the primary intent"
            />
          )}

          {/* Emotional Arc */}
          <DimensionCard
            icon={<Activity className="w-4 h-4" />}
            label="Emotional Arc"
            value={intelligence.conversationArc}
            color={getArcColor(
              intelligence.emotionalStateStart,
              intelligence.emotionalStateEnd
            )}
            tooltip="How the user's emotional state evolved during the conversation"
            badge={getArcBadge(
              intelligence.emotionalStateStart,
              intelligence.emotionalStateEnd
            )}
          />

          {/* Innate Desire */}
          <DimensionCard
            icon={<Heart className="w-4 h-4" />}
            label="Innate Desire"
            value={formatDesire(intelligence.innateDesire)}
            color="rose"
            tooltip="What the user actually needs beneath what they asked - the emotional driver"
          />

          {/* Health Literacy */}
          <DimensionCard
            icon={<Brain className="w-4 h-4" />}
            label="Health Literacy"
            value={formatLiteracy(intelligence.healthLiteracy)}
            color={getLiteracyColor(intelligence.healthLiteracy)}
            tooltip="How the AI should speak to them based on their medical knowledge level"
          />

          {/* Readiness to Act */}
          <DimensionCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Readiness to Act"
            value={formatReadiness(intelligence.readinessToAct)}
            color="emerald"
            tooltip="Where the user sits on the behavioral change spectrum"
          />

          {/* Trust Signal */}
          <DimensionCard
            icon={<Shield className="w-4 h-4" />}
            label="Trust Level"
            value={formatTrust(intelligence.trustSignal)}
            color={getTrustColor(intelligence.trustSignal)}
            tooltip="User's expressed confidence in the AI across the session"
            badge={getTrustBadge(intelligence.trustSignal)}
          />

          {/* Engagement Depth */}
          <DimensionCard
            icon={<Sparkles className="w-4 h-4" />}
            label="Engagement Depth"
            value={formatEngagement(intelligence.engagementDepth)}
            color="violet"
            tooltip="Quality of user's involvement - not just duration, but emotional investment"
          />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Generated {new Date(intelligence.generatedAt).toLocaleString()} •
            Healthcare-compliant psychological analysis
          </p>
        </div>
      </Card>
    </TooltipProvider>
  );
}

// ── Compact Portrait (for table rows) ──────────────────────────────────────────

function CompactPortrait({ intelligence }: { intelligence: ConversationIntelligence }) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Persona Icon + Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`${getPersonaBgColor(intelligence.personaArchetype)} border-none`}
            >
              {getPersonaEmoji(intelligence.personaArchetype)}{" "}
              {formatPersonaShort(intelligence.personaArchetype)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm font-medium">{formatPersona(intelligence.personaArchetype)}</p>
          </TooltipContent>
        </Tooltip>

        {/* Emotional Arc Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`${getArcBgColor(
                intelligence.emotionalStateStart,
                intelligence.emotionalStateEnd
              )} border-none`}
            >
              {intelligence.conversationArc}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Emotional journey during conversation</p>
          </TooltipContent>
        </Tooltip>

        {/* Trust Signal */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`${getTrustBgColor(intelligence.trustSignal)} border-none`}
            >
              <Shield className="w-3 h-3 mr-1" />
              {formatTrust(intelligence.trustSignal)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">User&apos;s trust level with the AI</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

// ── Dimension Card Component ───────────────────────────────────────────────────

interface DimensionCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  tooltip: string;
  badge?: string;
}

function DimensionCard({
  icon,
  label,
  value,
  color,
  tooltip,
  badge,
}: DimensionCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors cursor-help">
          <div className="flex items-center gap-2 mb-2">
            <div className={`text-${color}-600`}>{icon}</div>
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              {label}
            </span>
            {badge && (
              <Badge variant="outline" className="ml-auto text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className={`text-sm font-semibold text-${color}-700`}>{value}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm max-w-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// ── Formatting Functions ────────────────────────────────────────────────────────

function formatPersona(persona: string): string {
  return persona
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatPersonaShort(persona: string): string {
  const short: Record<string, string> = {
    newly_diagnosed: "Newly Dx",
    veteran_patient: "Veteran",
    anxious_worrier: "Anxious",
    skeptic: "Skeptic",
    caregiver: "Caregiver",
    information_seeker: "Info Seeker",
    action_taker: "Action",
    emotional_processor: "Emotional",
  };
  return short[persona] || formatPersona(persona);
}

function formatIntent(intent: string): string {
  return intent
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDesire(desire: string): string {
  return desire
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatLiteracy(lit: string): string {
  return lit.charAt(0).toUpperCase() + lit.slice(1);
}

function formatReadiness(readiness: string): string {
  return readiness
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatTrust(trust: string): string {
  return trust
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatEngagement(eng: string): string {
  return eng.charAt(0).toUpperCase() + eng.slice(1);
}

// ── Color & Badge Helpers ───────────────────────────────────────────────────────

function getPersonaColor(persona: string): string {
  const colors: Record<string, string> = {
    newly_diagnosed: "amber",
    veteran_patient: "purple",
    anxious_worrier: "rose",
    skeptic: "slate",
    caregiver: "emerald",
    information_seeker: "blue",
    action_taker: "green",
    emotional_processor: "pink",
  };
  return colors[persona] || "slate";
}

function getPersonaEmoji(persona: string): string {
  const emojis: Record<string, string> = {
    newly_diagnosed: "🆕",
    veteran_patient: "🎖️",
    anxious_worrier: "😰",
    skeptic: "🤔",
    caregiver: "❤️",
    information_seeker: "🔍",
    action_taker: "⚡",
    emotional_processor: "💭",
  };
  return emojis[persona] || "👤";
}

function getPersonaBgColor(persona: string): string {
  const colors: Record<string, string> = {
    newly_diagnosed: "bg-amber-50 text-amber-700",
    veteran_patient: "bg-purple-50 text-purple-700",
    anxious_worrier: "bg-rose-50 text-rose-700",
    skeptic: "bg-slate-50 text-slate-700",
    caregiver: "bg-emerald-50 text-emerald-700",
    information_seeker: "bg-blue-50 text-blue-700",
    action_taker: "bg-green-50 text-green-700",
    emotional_processor: "bg-pink-50 text-pink-700",
  };
  return colors[persona] || "bg-slate-50 text-slate-700";
}

function getArcColor(start: string, end: string): string {
  // Success: anxiety → calm
  if (
    (start === "MILDLY_ANXIOUS" || start === "HIGHLY_ANXIOUS") &&
    (end === "CALM_CURIOUS" || end === "HOPEFUL")
  ) {
    return "emerald";
  }
  // Warning: worsened
  if (start === "MILDL Y_ANXIOUS" && end === "HIGHLY_ANXIOUS") {
    return "red";
  }
  // Neutral: no change or lateral
  return "blue";
}

function getArcBgColor(start: string, end: string): string {
  const color = getArcColor(start, end);
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return colorMap[color] || "bg-blue-50 text-blue-700";
}

function getArcBadge(start: string, end: string): string | undefined {
  if (
    (start === "MILDLY_ANXIOUS" || start === "HIGHLY_ANXIOUS") &&
    (end === "CALM_CURIOUS" || end === "HOPEFUL")
  ) {
    return "✓ De-escalated";
  }
  if (start === "MILDLY_ANXIOUS" && end === "HIGHLY_ANXIOUS") {
    return "⚠ Escalated";
  }
  return undefined;
}

function getLiteracyColor(lit: string): string {
  const colors: Record<string, string> = {
    beginner: "amber",
    intermediate: "blue",
    advanced: "purple",
  };
  return colors[lit] || "slate";
}

function getTrustColor(trust: string): string {
  const colors: Record<string, string> = {
    high: "emerald",
    neutral: "slate",
    low: "amber",
    active_distrust: "red",
  };
  return colors[trust] || "slate";
}

function getTrustBgColor(trust: string): string {
  const colors: Record<string, string> = {
    high: "bg-emerald-50 text-emerald-700",
    neutral: "bg-slate-50 text-slate-700",
    low: "bg-amber-50 text-amber-700",
    active_distrust: "bg-red-50 text-red-700",
  };
  return colors[trust] || "bg-slate-50 text-slate-700";
}

function getTrustBadge(trust: string): string | undefined {
  if (trust === "high") return "✓ High";
  if (trust === "low" || trust === "active_distrust") return "⚠ Low";
  return undefined;
}
