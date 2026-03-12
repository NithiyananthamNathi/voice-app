"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2, Loader2, Plus, Save,
  Clock, MessageSquare, Phone, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type EvaluationCriterion,
  type DataCollectionPoint,
} from "@/components/agent/analysis-settings";

interface EvalResult {
  id: string;
  criterionId: string;
  criterionName: string;
  type: string;
  result: boolean | null;
  score: number | null;
  analysis: string;
}

interface ConversationAnalysis {
  conversationId: string;
  callerName: string | null;
  createdAt: string;
  mode: string;
  duration: number | null;
  messageCount: number;
  evaluationResults: EvalResult[];
  collectedData: { id: string; dataPointName: string; dataType: string; value: string }[];
  summary: { totalCriteria: number; passed: number; failed: number; passRate: number | null };
}

interface AnalysisResultsTabProps {
  agentId: string;
  evaluationCriteria: EvaluationCriterion[];
  dataCollectionPoints: DataCollectionPoint[];
  analysisLanguage: string;
  enableAnalysis: boolean;
  onEvaluationCriteriaChange: (criteria: EvaluationCriterion[]) => void;
  onDataCollectionPointsChange: (points: DataCollectionPoint[]) => void;
  onAnalysisLanguageChange: (lang: string) => void;
  onEnableAnalysisChange: (enabled: boolean) => void;
  isSavingAnalysis: boolean;
  onSaveAnalysis: () => void;
}

const fmtDuration = (s: number | null) => {
  if (!s) return "--";
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

function EditPanel({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AnalysisResultsTab(props: AnalysisResultsTabProps) {
  const {
    agentId, evaluationCriteria, dataCollectionPoints, analysisLanguage, enableAnalysis,
    onEvaluationCriteriaChange, onDataCollectionPointsChange,
    onAnalysisLanguageChange, onEnableAnalysisChange, isSavingAnalysis, onSaveAnalysis,
  } = props;

  const [conversationAnalysis, setConversationAnalysis] = useState<ConversationAnalysis[]>([]);
  const [totalConversations, setTotalConversations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [editingCriterion, setEditingCriterion] = useState<EvaluationCriterion | null>(null);
  const [editingDataPoint, setEditingDataPoint] = useState<DataCollectionPoint | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDataType, setEditDataType] = useState("string");

  useEffect(() => { fetchAnalysis(); }, [agentId]);

  const fetchAnalysis = async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}/analysis`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setConversationAnalysis(data.conversationAnalysis || []);
      setTotalConversations(data.totalConversations || 0);
    } catch (e) {
      console.error("Failed to fetch analysis:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const criterionNames = evaluationCriteria.filter(c => c.isActive).map(c => c.name);

  const openEditCriterion = (criterion: EvaluationCriterion) => {
    setEditingCriterion(criterion);
    setEditName(criterion.name);
    setEditPrompt(criterion.prompt);
    setEditDescription(criterion.description || "");
    setEditingDataPoint(null);
  };

  const openEditDataPoint = (dp: DataCollectionPoint) => {
    setEditingDataPoint(dp);
    setEditName(dp.name);
    setEditPrompt(dp.prompt);
    setEditDescription(dp.description || "");
    setEditDataType(dp.dataType);
    setEditingCriterion(null);
  };

  const saveCriterionEdit = () => {
    if (!editingCriterion) return;
    onEvaluationCriteriaChange(evaluationCriteria.map(c =>
      c.id === editingCriterion.id ? { ...c, name: editName, prompt: editPrompt, description: editDescription } : c
    ));
    setEditingCriterion(null);
  };

  const saveDataPointEdit = () => {
    if (!editingDataPoint) return;
    onDataCollectionPointsChange(dataCollectionPoints.map(d =>
      d.id === editingDataPoint.id ? { ...d, name: editName, prompt: editPrompt, description: editDescription, dataType: editDataType as DataCollectionPoint["dataType"] } : d
    ));
    setEditingDataPoint(null);
  };

  const addCriterion = () => {
    const c: EvaluationCriterion = {
      id: `criterion-${Date.now()}`, name: "New Criterion", description: "",
      prompt: "Evaluate whether...", type: "boolean", isActive: true,
    };
    onEvaluationCriteriaChange([...evaluationCriteria, c]);
    openEditCriterion(c);
  };

  const addDataPoint = () => {
    const d: DataCollectionPoint = {
      id: `datapoint-${Date.now()}`, name: "New Data Point", description: "",
      dataType: "string", prompt: "Extract the...", isRequired: false, isActive: true,
    };
    onDataCollectionPointsChange([...dataCollectionPoints, d]);
    openEditDataPoint(d);
  };

  const removeCriterion = (id: string) => onEvaluationCriteriaChange(evaluationCriteria.filter(c => c.id !== id));
  const removeDataPoint = (id: string) => onDataCollectionPointsChange(dataCollectionPoints.filter(d => d.id !== id));
  const toggleCriterion = (id: string) => onEvaluationCriteriaChange(evaluationCriteria.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  const toggleDataPoint = (id: string) => onDataCollectionPointsChange(dataCollectionPoints.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* LEFT: Conversation analysis table */}
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">Analysis</h2>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px]">{totalConversations} conversations</Badge>
            </div>
          </div>

          <ScrollArea className="max-h-[700px]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-2.5 whitespace-nowrap">Date</th>
                    <th className="text-left text-[11px] font-medium text-gray-500 px-3 py-2.5 whitespace-nowrap">Duration</th>
                    <th className="text-left text-[11px] font-medium text-gray-500 px-3 py-2.5 whitespace-nowrap">Messages</th>
                    {criterionNames.map(name => (
                      <th key={name} className="text-center text-[11px] font-medium text-gray-500 px-2 py-2.5 whitespace-nowrap max-w-[120px]">
                        <span className="truncate block" title={name}>{name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {conversationAnalysis.length === 0 ? (
                    <tr>
                      <td colSpan={3 + criterionNames.length} className="text-center py-12 text-sm text-gray-400">
                        No conversations analyzed yet
                      </td>
                    </tr>
                  ) : (
                    conversationAnalysis.map(conv => {
                      const resultMap: Record<string, boolean | null> = {};
                      for (const r of conv.evaluationResults) {
                        resultMap[r.criterionName] = r.result;
                      }

                      return (
                        <tr key={conv.conversationId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                                conv.mode === "voice" ? "bg-gray-100" : "bg-gray-50"
                              )}>
                                {conv.mode === "voice"
                                  ? <Phone className="h-3 w-3 text-gray-500" />
                                  : <MessageSquare className="h-3 w-3 text-gray-400" />}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-900" suppressHydrationWarning>{fmtDate(conv.createdAt)}</p>
                                <p className="text-[10px] text-gray-400">{conv.callerName || "Anonymous"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              {fmtDuration(conv.duration)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-xs text-gray-600">{conv.messageCount > 0 ? conv.messageCount : "--"}</span>
                          </td>
                          {criterionNames.map(name => {
                            const result = resultMap[name];
                            return (
                              <td key={name} className="px-2 py-2.5 text-center">
                                {result === undefined ? (
                                  <span className="text-[10px] text-gray-300">--</span>
                                ) : result ? (
                                  <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] px-2 py-0.5 font-medium">
                                    Success
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-50 text-red-600 border-0 text-[10px] px-2 py-0.5 font-medium">
                                    Failed
                                  </Badge>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* RIGHT: Configuration sidebar */}
      <div className="w-[300px] shrink-0 space-y-5">
        {/* Evaluation criteria */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Evaluation criteria</h3>
          <p className="text-[11px] text-gray-400 mb-3">Define criteria to evaluate whether conversations were successful.</p>
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px] mb-3">
            {evaluationCriteria.filter(c => c.isActive).length} criteria
          </Badge>

          <div className="space-y-1.5">
            {evaluationCriteria.map(c => (
              <div key={c.id} className="flex items-center gap-2 group">
                <input
                  type="checkbox"
                  checked={c.isActive}
                  onChange={() => toggleCriterion(c.id)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
                <button
                  onClick={() => openEditCriterion(c)}
                  className="flex-1 text-left text-xs text-gray-700 hover:text-gray-900 transition-colors truncate"
                  title={c.name}
                >
                  {c.name}
                </button>
                <button onClick={() => removeCriterion(c.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addCriterion} className="mt-3 flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 font-medium">
            <Plus className="h-3 w-3" /> Add criteria
          </button>
        </div>

        {/* Data collection */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Data collection</h3>
          <p className="text-[11px] text-gray-400 mb-3">Define custom data specifications to extract from conversation content.</p>
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px] mb-3">
            {dataCollectionPoints.filter(d => d.isActive).length} data points
          </Badge>

          <div className="space-y-1.5">
            {dataCollectionPoints.map(d => (
              <div key={d.id} className="flex items-center gap-2 group">
                <input
                  type="checkbox"
                  checked={d.isActive}
                  onChange={() => toggleDataPoint(d.id)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
                <button
                  onClick={() => openEditDataPoint(d)}
                  className="flex-1 text-left text-xs text-gray-700 hover:text-gray-900 transition-colors truncate"
                  title={d.name}
                >
                  {d.name}
                </button>
                <Badge variant="secondary" className="text-[9px] bg-gray-50 text-gray-400 shrink-0">{d.dataType}</Badge>
                <button onClick={() => removeDataPoint(d.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addDataPoint} className="mt-3 flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 font-medium">
            <Plus className="h-3 w-3" /> Add data point
          </button>
        </div>

        {/* Enable Analysis */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Enable Analysis</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Run evaluation after each conversation ends</p>
            </div>
            <Switch checked={enableAnalysis} onCheckedChange={onEnableAnalysisChange} />
          </div>
        </div>

        {/* Analysis Language */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Analysis Language</h3>
          <Select value={analysisLanguage} onValueChange={onAnalysisLanguageChange}>
            <SelectTrigger className="w-full bg-white border-gray-200 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="auto">Auto Infer from conversations</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="ko">Korean</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onSaveAnalysis} disabled={isSavingAnalysis} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
          {isSavingAnalysis ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
        </Button>
      </div>

      {/* Slide-out edit panels */}
      {editingCriterion && (
        <EditPanel title="Edit Evaluation Criterion" onClose={() => setEditingCriterion(null)}>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-700">Criteria name</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="mt-1.5 bg-white border-gray-200" />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">Description</Label>
              <Input value={editDescription} onChange={e => setEditDescription(e.target.value)} className="mt-1.5 bg-white border-gray-200" placeholder="Brief description..." />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">Evaluation Instructions</Label>
              <Textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} className="mt-1.5 bg-white border-gray-200 min-h-[120px]" placeholder="Describe what the agent should evaluate..." />
            </div>
            <Button onClick={saveCriterionEdit} className="w-full bg-gray-900 hover:bg-gray-800 text-white">Save Criterion</Button>
          </div>
        </EditPanel>
      )}

      {editingDataPoint && (
        <EditPanel title="Edit Data Point" onClose={() => setEditingDataPoint(null)}>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-700">Data type</Label>
              <Select value={editDataType} onValueChange={setEditDataType}>
                <SelectTrigger className="mt-1.5 bg-white border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">Identifier</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="mt-1.5 bg-white border-gray-200" />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">Description</Label>
              <Input value={editDescription} onChange={e => setEditDescription(e.target.value)} className="mt-1.5 bg-white border-gray-200" placeholder="Brief description..." />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">Extraction Instructions</Label>
              <Textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} className="mt-1.5 bg-white border-gray-200 min-h-[120px]" placeholder="Describe what data to extract..." />
            </div>
            <Button onClick={saveDataPointEdit} className="w-full bg-gray-900 hover:bg-gray-800 text-white">Save Data Point</Button>
          </div>
        </EditPanel>
      )}
    </div>
  );
}
