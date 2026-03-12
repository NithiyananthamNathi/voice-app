"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ConversationIntelligence } from "@/lib/store";
import {
  Users,
  Target,
  Activity,
  Shield,
  Sparkles,
} from "lucide-react";

interface IntelligenceSummaryProps {
  conversations: Array<{ intelligence: ConversationIntelligence | null }>;
  compact?: boolean;
}

export function IntelligenceSummary({ conversations, compact = false }: IntelligenceSummaryProps) {
  const withIntelligence = conversations.filter(c => c.intelligence !== null);
  
  if (withIntelligence.length === 0) {
    return null;
  }

  const intelligences = withIntelligence
    .map(c => c.intelligence)
    .filter((i): i is ConversationIntelligence => 
      i !== null && 
      i !== undefined && 
      typeof i === 'object' && 
      'personaArchetype' in i && 
      'primaryIntent' in i
    );

  if (intelligences.length === 0) {
    return null;
  }

  // Calculate quick metrics
  const topPersona = getTopValue(intelligences.map(i => i.personaArchetype).filter(Boolean));
  const topIntent = getTopValue(intelligences.map(i => i.primaryIntent).filter(Boolean));
  
  const positiveArcs = intelligences.filter(i => 
    ['CALM_CURIOUS', 'HOPEFUL'].includes(i.emotionalStateEnd)
  ).length;
  const arcSuccessRate = Math.round((positiveArcs / intelligences.length) * 100);

  const highTrust = intelligences.filter(i => i.trustSignal === 'high').length;
  const trustRate = Math.round((highTrust / intelligences.length) * 100);

  if (compact) {
    return (
      <Card className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-900">Intelligence Summary</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {withIntelligence.length} analyzed
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Top Persona</p>
            <p className="text-sm font-medium text-slate-900">
              {formatValue(topPersona)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Success Rate</p>
            <p className="text-sm font-medium text-emerald-600">{arcSuccessRate}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Top Intent</p>
            <p className="text-sm font-medium text-slate-900">
              {formatValue(topIntent)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">High Trust</p>
            <p className="text-sm font-medium text-green-600">{trustRate}%</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Intelligence Summary</h3>
        <Badge variant="secondary" className="ml-auto">
          {withIntelligence.length} conversations analyzed
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Top Persona</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">
            {formatValue(topPersona)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-600">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium">Top Intent</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">
            {formatValue(topIntent)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-600">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium">Success Rate</span>
          </div>
          <p className="text-lg font-semibold text-emerald-600">
            {arcSuccessRate}%
          </p>
          <Progress value={arcSuccessRate} className="h-1.5 [&>div]:bg-emerald-500" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-600">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">High Trust</span>
          </div>
          <p className="text-lg font-semibold text-green-600">
            {trustRate}%
          </p>
          <Progress value={trustRate} className="h-1.5 [&>div]:bg-green-500" />
        </div>
      </div>
    </Card>
  );
}

// Helper functions
function getTopValue<T extends string>(values: T[]): T | null {
  if (values.length === 0) return null;
  
  const counts = new Map<T, number>();
  values.forEach(v => {
    counts.set(v, (counts.get(v) || 0) + 1);
  });

  let topValue: T | null = null;
  let maxCount = 0;
  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      topValue = value;
    }
  });

  return topValue;
}

function formatValue(value: string | null): string {
  if (!value) return 'N/A';
  return value
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
