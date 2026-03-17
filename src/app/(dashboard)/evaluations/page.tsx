"use client";

import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, FlaskConical, ChevronDown, ChevronRight, Play, CheckCircle2,
  XCircle, AlertTriangle, BarChart3, MessageSquare, Bot, BookOpen,
  Scale, ShieldCheck, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EVAL_RUBRICS, countCriteria, type RubricCategory, type RubricSubCategory } from "@/lib/eval-rubrics";

// ── Types ───────────────────────────────────────────────────────────────────

interface EvalRound {
  roundNumber: number;
  judge: { status: "YES" | "NO" | "PARTIAL"; reason: string };
  critique: { confidence: number; feedback: string };
}

interface EvalRun {
  id: string;
  agentId: string;
  agentName: string;
  conversationId: string;
  conversationName: string;
  rubricCategory: string;
  rubricSubCategory: string;
  criteria: string;
  judgeModel: string;
  critiqueModel: string;
  status: string;
  rounds: EvalRound[];
  finalVerdict: "YES" | "NO" | "PARTIAL" | null;
  finalConfidence: number | null;
  createdAt: string;
}

interface AgentOption {
  id: string;
  name: string;
}

interface ConversationOption {
  id: string;
  callerName: string | null;
  mode: string;
  createdAt: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const verdictConfig = {
  YES: { label: "Pass", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  NO: { label: "Fail", color: "bg-red-100 text-red-700", icon: XCircle },
  PARTIAL: { label: "Partial", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
};

function VerdictBadge({ verdict }: { verdict: "YES" | "NO" | "PARTIAL" | null }) {
  if (!verdict) return <Badge variant="secondary" className="text-[10px]">Pending</Badge>;
  const cfg = verdictConfig[verdict];
  const Icon = cfg.icon;
  return (
    <Badge className={cn("text-xs border-0 gap-1", cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

function ConfidenceBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  return (
    <span className={cn(
      "text-xs font-bold px-2 py-0.5 rounded",
      score >= 90 ? "bg-emerald-100 text-emerald-700" :
      score >= 75 ? "bg-amber-100 text-amber-700" :
      "bg-red-100 text-red-700"
    )}>
      {score}/100
    </span>
  );
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

// ── Main Page Component ─────────────────────────────────────────────────────

export default function EvalsPage() {
  const [evalRuns, setEvalRuns] = useState<EvalRun[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"runs" | "rubrics" | "settings">("runs");
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [showNewEval, setShowNewEval] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/evals", { credentials: "include" }).then(r => r.ok ? r.json() : []),
      fetch("/api/agents", { credentials: "include" }).then(r => r.ok ? r.json() : []),
    ]).then(([runs, agts]) => {
      setEvalRuns(runs);
      setAgents(agts.map((a: any) => ({ id: a.id, name: a.name })));
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const stats = useMemo(() => {
    const completed = evalRuns.filter(r => r.status === "completed");
    const avgConfidence = completed.length > 0
      ? Math.round(completed.reduce((s, r) => s + (r.finalConfidence || 0), 0) / completed.length)
      : null;
    const passRate = completed.length > 0
      ? Math.round(completed.filter(r => r.finalVerdict === "YES").length / completed.length * 100)
      : null;
    return { total: evalRuns.length, completed: completed.length, avgConfidence, passRate };
  }, [evalRuns]);

  const handleNewEvalComplete = (run: EvalRun) => {
    setEvalRuns(prev => [run, ...prev]);
    setShowNewEval(false);
    setExpandedRun(run.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evals</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Judge + Critique agent evaluation pipeline for medical AI conversations
          </p>
        </div>
        <Button onClick={() => setShowNewEval(true)} className="bg-gray-900 hover:bg-gray-800">
          <Play className="h-4 w-4 mr-2" />
          Run Evaluation
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="py-3 px-4">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Total Runs</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="py-3 px-4">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Completed</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="py-3 px-4">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Avg Confidence</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {stats.avgConfidence !== null ? `${stats.avgConfidence}%` : "--"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="py-3 px-4">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Pass Rate</p>
            <p className={cn("text-2xl font-bold mt-0.5", stats.passRate !== null && stats.passRate >= 70 ? "text-emerald-600" : stats.passRate !== null ? "text-amber-600" : "text-gray-900")}>
              {stats.passRate !== null ? `${stats.passRate}%` : "--"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: "runs" as const, label: "Evaluation Runs", icon: FlaskConical },
          { id: "rubrics" as const, label: "Rubrics", icon: BookOpen },
          { id: "settings" as const, label: "Configuration", icon: Scale },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "runs" && (
        <EvalRunsTab
          evalRuns={evalRuns}
          expandedRun={expandedRun}
          onToggleExpand={(id) => setExpandedRun(expandedRun === id ? null : id)}
        />
      )}
      {activeTab === "rubrics" && <RubricsTab />}
      {activeTab === "settings" && <SettingsTab />}

      {/* New Eval Dialog */}
      {showNewEval && (
        <NewEvalPanel
          agents={agents}
          onClose={() => setShowNewEval(false)}
          onComplete={handleNewEvalComplete}
        />
      )}
    </div>
  );
}

// ── Eval Runs Tab ───────────────────────────────────────────────────────────

function EvalRunsTab({
  evalRuns,
  expandedRun,
  onToggleExpand,
}: {
  evalRuns: EvalRun[];
  expandedRun: string | null;
  onToggleExpand: (id: string) => void;
}) {
  if (evalRuns.length === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="py-12 text-center">
          <FlaskConical className="h-12 w-12 mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluation runs yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Run your first evaluation using the Judge + Critique pipeline to assess conversation quality against medical rubrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {evalRuns.map(run => (
        <Card key={run.id} className="bg-white border-gray-200 overflow-hidden">
          {/* Run Header */}
          <button
            onClick={() => onToggleExpand(run.id)}
            className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors text-left"
          >
            {expandedRun === run.id
              ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
              : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {run.conversationName}
                </span>
                <span className="text-[11px] text-gray-400">·</span>
                <span className="text-[11px] text-gray-500">{run.agentName}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {run.rubricCategory} → {run.rubricSubCategory}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <ConfidenceBadge score={run.finalConfidence} />
              <VerdictBadge verdict={run.finalVerdict} />
              <span className="text-[11px] text-gray-400 whitespace-nowrap" suppressHydrationWarning>
                {fmtDate(run.createdAt)}
              </span>
            </div>
          </button>

          {/* Expanded Detail */}
          {expandedRun === run.id && (
            <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/30">
              {/* Criteria */}
              <div className="mb-4 px-4 py-3 bg-white rounded-lg border border-gray-200">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">Criteria</p>
                <p className="text-sm text-gray-800">{run.criteria}</p>
              </div>

              {/* Model Info */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Judge: <span className="font-medium text-gray-700">{run.judgeModel.split("-").slice(0, 3).join(" ")}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Scale className="h-3.5 w-3.5" />
                  <span>Critique: <span className="font-medium text-gray-700">{run.critiqueModel.split("-").slice(0, 2).join(" ")}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{run.rounds.length} round{run.rounds.length !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Rounds */}
              <div className="space-y-4">
                {run.rounds.map((round) => (
                  <div key={round.roundNumber} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">Round {round.roundNumber}</span>
                      <div className="flex items-center gap-2">
                        <VerdictBadge verdict={round.judge.status} />
                        <ConfidenceBadge score={round.critique.confidence} />
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {/* Judge */}
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-xs font-semibold text-gray-700">Judge</span>
                          <VerdictBadge verdict={round.judge.status} />
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{round.judge.reason}</p>
                      </div>

                      {/* Critique */}
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Scale className="h-3.5 w-3.5 text-purple-500" />
                          <span className="text-xs font-semibold text-gray-700">Critique</span>
                          <ConfidenceBadge score={round.critique.confidence} />
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{round.critique.feedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ── Rubrics Tab ─────────────────────────────────────────────────────────────

function RubricsTab() {
  const [expandedCat, setExpandedCat] = useState<string | null>(EVAL_RUBRICS[0]?.id || null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Medical evaluation rubrics organized by category. Select criteria from these rubrics when running evaluations.
      </p>

      {EVAL_RUBRICS.map(cat => (
        <Card key={cat.id} className="bg-white border-gray-200 overflow-hidden">
          <button
            onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
            className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors text-left"
          >
            {expandedCat === cat.id
              ? <ChevronDown className="h-4 w-4 text-gray-400" />
              : <ChevronRight className="h-4 w-4 text-gray-400" />}
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">
                {cat.id}. {cat.name}
              </span>
              <span className="text-[11px] text-gray-400 ml-2">
                {cat.subCategories.length} sub-categories
              </span>
            </div>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px]">
              {cat.subCategories.reduce((s, sub) => s + countCriteria(sub), 0)} criteria
            </Badge>
          </button>

          {expandedCat === cat.id && (
            <div className="border-t border-gray-100">
              {cat.subCategories.map(sub => (
                <SubCategoryRow
                  key={sub.id}
                  sub={sub}
                  isExpanded={expandedSub === sub.id}
                  onToggle={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}
                />
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function SubCategoryRow({
  sub,
  isExpanded,
  onToggle,
}: {
  sub: RubricSubCategory;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const sections = [
    { label: "Response", items: sub.response, color: "text-blue-600 bg-blue-50" },
    { label: "Chain of Thought", items: sub.chainOfThought, color: "text-purple-600 bg-purple-50" },
    { label: "Citation", items: sub.citation, color: "text-amber-600 bg-amber-50" },
    { label: "Follow-up", items: sub.followUp, color: "text-emerald-600 bg-emerald-50" },
  ].filter(s => s.items.length > 0);

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button
        onClick={onToggle}
        className="w-full px-5 py-2.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors text-left pl-10"
      >
        {isExpanded
          ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
        <span className="text-sm text-gray-800 font-medium flex-1">
          {sub.id}. {sub.name}
        </span>
        <div className="flex gap-2">
          {sections.map(s => (
            <Badge key={s.label} variant="secondary" className={cn("text-[9px]", s.color)}>
              {s.items.length} {s.label}
            </Badge>
          ))}
        </div>
      </button>

      {isExpanded && (
        <div className="px-10 pb-4 space-y-4">
          {sections.map(section => (
            <div key={section.label}>
              <h5 className={cn("text-xs font-semibold mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded", section.color)}>
                {section.label} Rubrics
              </h5>
              <ul className="space-y-1.5 ml-1">
                {section.items.map((item, i) => (
                  <li key={item.id} className="flex gap-2 text-xs text-gray-600 leading-relaxed">
                    <span className="text-gray-400 shrink-0 w-4 text-right">{i + 1}.</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ────────────────────────────────────────────────────────────

function SettingsTab() {
  const [judgeModel, setJudgeModel] = useState("claude-sonnet-4-5-20250514");
  const [critiqueModel, setCritiqueModel] = useState("gemini-2.5-pro");

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            Judge Model
          </CardTitle>
          <p className="text-xs text-gray-500">
            The physician model that evaluates conversations against criteria. Provides YES/NO/PARTIAL verdicts with reasoning.
          </p>
        </CardHeader>
        <CardContent>
          <Select value={judgeModel} onValueChange={setJudgeModel}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="claude-sonnet-4-5-20250514">Claude Sonnet 4.5</SelectItem>
              <SelectItem value="claude-opus-4-6">Claude Opus 4.6</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4 text-purple-500" />
            Critique Model
          </CardTitle>
          <p className="text-xs text-gray-500">
            Reviews the judge&apos;s evaluation for accuracy. Provides confidence scores (0-100) and improvement feedback. Triggers re-evaluation when confidence is low.
          </p>
        </CardHeader>
        <CardContent>
          <Select value={critiqueModel} onValueChange={setCritiqueModel}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
              <SelectItem value="claude-sonnet-4-5-20250514">Claude Sonnet 4.5</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Evaluation Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
              <ShieldCheck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-blue-700">Judge</p>
              <p className="text-[10px] text-blue-500">Evaluates conversation</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
            <div className="flex-1 p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
              <Scale className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-purple-700">Critique</p>
              <p className="text-[10px] text-purple-500">Reviews judge output</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
            <div className="flex-1 p-3 bg-amber-50 rounded-lg border border-amber-100 text-center">
              <BarChart3 className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-amber-700">Re-evaluate</p>
              <p className="text-[10px] text-amber-500">If confidence &lt; 90</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-3 text-center">
            The critique agent triggers re-evaluation when the judge&apos;s confidence score is below 90, ensuring higher quality assessments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── New Evaluation Panel ────────────────────────────────────────────────────

function NewEvalPanel({
  agents,
  onClose,
  onComplete,
}: {
  agents: AgentOption[];
  onClose: () => void;
  onComplete: (run: EvalRun) => void;
}) {
  const [agentId, setAgentId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [conversations, setConversations] = useState<ConversationOption[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [criteria, setCriteria] = useState("");
  const [rubricCategory, setRubricCategory] = useState("");
  const [rubricSubCategory, setRubricSubCategory] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Flatten rubric sub-categories for picker
  const allSubCategories = useMemo(() => {
    const items: { catId: string; catName: string; sub: RubricSubCategory }[] = [];
    for (const cat of EVAL_RUBRICS) {
      for (const sub of cat.subCategories) {
        items.push({ catId: cat.id, catName: cat.name, sub });
      }
    }
    return items;
  }, []);

  // Get criteria for selected sub-category
  const selectedSubCriteria = useMemo(() => {
    if (!rubricSubCategory) return [];
    const item = allSubCategories.find(i => i.sub.id === rubricSubCategory);
    if (!item) return [];
    const all: string[] = [];
    for (const c of item.sub.response) all.push(c.text);
    for (const c of item.sub.chainOfThought) all.push(c.text);
    for (const c of item.sub.citation) all.push(c.text);
    for (const c of item.sub.followUp) all.push(c.text);
    return all;
  }, [rubricSubCategory, allSubCategories]);

  // Fetch conversations when agent changes
  useEffect(() => {
    if (!agentId) { setConversations([]); return; }
    setLoadingConvs(true);
    fetch(`/api/agents/${agentId}/conversations`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(convs => setConversations(convs.map((c: any) => ({
        id: c.id,
        callerName: c.callerName,
        mode: c.mode,
        createdAt: c.createdAt,
      }))))
      .catch(() => setConversations([]))
      .finally(() => setLoadingConvs(false));
  }, [agentId]);

  const handleRun = async () => {
    if (!agentId || !conversationId || !criteria) return;
    setIsRunning(true);

    // Find selected category/sub-category names
    const subItem = allSubCategories.find(i => i.sub.id === rubricSubCategory);

    try {
      const res = await fetch("/api/evals", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          conversationId,
          rubricCategory: subItem?.catName || "Custom",
          rubricSubCategory: subItem?.sub.name || "Custom",
          criteria,
        }),
      });
      if (res.ok) {
        const run = await res.json();
        onComplete(run);
      }
    } catch (e) {
      console.error("Eval failed:", e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Run Evaluation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {/* Agent Selection */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Agent</label>
              <Select value={agentId} onValueChange={(v) => { setAgentId(v); setConversationId(""); }}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      <span className="flex items-center gap-2">
                        <Bot className="h-3.5 w-3.5 text-gray-400" />
                        {a.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conversation Selection */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Conversation</label>
              {loadingConvs ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading conversations...
                </div>
              ) : (
                <Select value={conversationId} onValueChange={setConversationId} disabled={!agentId}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder={agentId ? "Select a conversation" : "Select an agent first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {conversations.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                          {c.callerName || "Anonymous"}
                          <span className="text-[10px] text-gray-400" suppressHydrationWarning>{fmtDate(c.createdAt)}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Rubric Category */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Rubric Category (optional)</label>
              <Select value={rubricSubCategory} onValueChange={(v) => {
                setRubricSubCategory(v);
                const item = allSubCategories.find(i => i.sub.id === v);
                if (item) setRubricCategory(item.catId);
              }}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Select from rubric library" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[300px]">
                  {EVAL_RUBRICS.map(cat => (
                    <div key={cat.id}>
                      <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {cat.id}. {cat.name}
                      </div>
                      {cat.subCategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                          <span className="text-[10px] text-gray-400 ml-1">({countCriteria(sub)})</span>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick-fill criteria from rubric */}
            {selectedSubCriteria.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Quick-fill from rubric</label>
                <ScrollArea className="max-h-[150px] border border-gray-200 rounded-lg">
                  <div className="p-2 space-y-1">
                    {selectedSubCriteria.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setCriteria(c)}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-100 transition-colors",
                          criteria === c && "bg-gray-100 font-medium text-gray-900"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Criteria Input */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Evaluation Criteria</label>
              <Textarea
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                placeholder="Enter the criteria to evaluate the conversation against, or select from rubrics above..."
                className="bg-white border-gray-200 min-h-[100px] text-sm"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Run Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleRun}
            disabled={!agentId || !conversationId || !criteria || isRunning}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isRunning ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running evaluation...</>
            ) : (
              <><Play className="h-4 w-4 mr-2" /> Run Judge + Critique Evaluation</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
