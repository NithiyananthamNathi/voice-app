"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, XCircle, BarChart3, Loader2, MessageSquare,
  ArrowRight, Database,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CriterionResult {
  name: string;
  total: number;
  passed: number;
  failed: number;
}

interface DataPointResult {
  name: string;
  dataType: string;
  collected: number;
  total: number;
}

interface AgentAnalysis {
  agentId: string;
  agentName: string;
  totalConversations: number;
  criteriaResults: CriterionResult[];
  dataPointResults: DataPointResult[];
  overallPassRate: number | null;
}

export default function EvaluationsPage() {
  const [agentAnalyses, setAgentAnalyses] = useState<AgentAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const agentsRes = await fetch("/api/agents", { credentials: "include" });
      if (!agentsRes.ok) return;
      const agents = await agentsRes.json();

      const analyses: AgentAnalysis[] = [];
      await Promise.all(agents.map(async (agent: any) => {
        const res = await fetch(`/api/agents/${agent.id}/analysis`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const criteriaResults = data.criteriaResults || [];
          const totalEvals = criteriaResults.reduce((s: number, c: CriterionResult) => s + c.total, 0);
          const totalPassed = criteriaResults.reduce((s: number, c: CriterionResult) => s + c.passed, 0);
          analyses.push({
            agentId: agent.id,
            agentName: agent.name,
            totalConversations: data.totalConversations || 0,
            criteriaResults,
            dataPointResults: data.dataPointResults || [],
            overallPassRate: totalEvals > 0 ? Math.round((totalPassed / totalEvals) * 100) : null,
          });
        }
      }));
      setAgentAnalyses(analyses);
    } catch (e) {
      console.error("Failed to fetch evaluations:", e);
    } finally {
      setIsLoading(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evaluations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Evaluation criteria results across all agents</p>
      </div>

      {agentAnalyses.length === 0 ? (
        <Card className="bg-white border-gray-200">
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluations yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                Create an agent with evaluation criteria, then have conversations. Results will appear here.
              </p>
              <Link href="/agents/new">
                <Button className="bg-gray-900 hover:bg-gray-800">Create Agent</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        agentAnalyses.map(analysis => (
          <Card key={analysis.agentId} className="bg-white border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-gray-900">{analysis.agentName}</CardTitle>
                  <CardDescription className="text-xs">
                    {analysis.totalConversations} conversations analyzed
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {analysis.overallPassRate !== null && (
                    <div className={cn("px-3 py-1.5 rounded-lg text-sm font-bold",
                      analysis.overallPassRate >= 80 ? "bg-emerald-100 text-emerald-700" :
                      analysis.overallPassRate >= 50 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {analysis.overallPassRate}%
                    </div>
                  )}
                  <Link href={`/agents/${analysis.agentId}`}>
                    <Button variant="outline" size="sm" className="border-gray-200 h-8 text-xs">
                      View Details <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Criteria results */}
              {analysis.criteriaResults.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Evaluation Criteria
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {analysis.criteriaResults.map((c, i) => {
                      const passRate = c.total > 0 ? Math.round((c.passed / c.total) * 100) : 0;
                      return (
                        <div key={i} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">{c.name}</span>
                            <Badge variant="secondary" className={cn("text-xs",
                              passRate >= 80 ? "bg-emerald-100 text-emerald-700" :
                              passRate >= 50 ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                            )}>{passRate}%</Badge>
                          </div>
                          <div className="flex gap-1 h-2.5 rounded-full overflow-hidden bg-gray-100">
                            <div className="bg-emerald-500 rounded-l-full" style={{ width: `${passRate}%` }} />
                            <div className="bg-red-400 rounded-r-full" style={{ width: `${100 - passRate}%` }} />
                          </div>
                          <div className="flex items-center justify-between mt-1.5 text-[11px] text-gray-500">
                            <span className="text-emerald-600">{c.passed} success</span>
                            <span className="text-red-500">{c.failed} failure</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Data collection results */}
              {analysis.dataPointResults.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-violet-600" />
                    Data Collection
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {analysis.dataPointResults.map((d, i) => {
                      const rate = d.total > 0 ? Math.round((d.collected / d.total) * 100) : 0;
                      return (
                        <div key={i} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">{d.name}</span>
                              <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600">{d.dataType}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${rate}%` }} />
                              </div>
                              <span className="text-xs text-gray-500">{rate}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {analysis.criteriaResults.length === 0 && analysis.dataPointResults.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  No evaluation criteria or data points configured for this agent
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
