"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe, Copy, Check, Loader2, HeartPulse, Wrench, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type EvaluationCriterion,
  type DataCollectionPoint,
} from "@/components/agent/analysis-settings";
import { AgentSettingsTab } from "@/components/agent/agent-settings-tab";
import { AgentConfigurationTab } from "@/components/agent/agent-configuration-tab";
import { KnowledgeBaseTab } from "@/components/agent/knowledge-base-tab";
import { ConversationsTab } from "@/components/agent/conversations-tab";
import { AnalysisResultsTab } from "@/components/agent/analysis-results-tab";
import { IntelligenceSummary } from "@/components/agent/intelligence-summary";
import type { ConversationIntelligence } from "@/lib/store";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  llmProvider: string;
  llmModel: string;
  isActive: boolean;
  isPublic: boolean;
  publicId: string | null;
  publishedAt: string | null;
  temperature: number;
  language: string;
  voiceId: string | null;
  firstMessage: string | null;
  systemPrompt: string;
  conversationCount: number;
  createdAt: string;
  allowInterrupt: boolean;
  analysisLanguage: string;
  enableAnalysis: boolean;
  evaluationCriteria: EvaluationCriterion[];
  dataCollectionPoints: DataCollectionPoint[];
  voiceEnabled: boolean;
  voiceStability: number;
  voiceSimilarityBoost: number;
  voiceStyleExaggeration: number;
  voiceSpeakerBoost: boolean;
  enableBackupLlm: boolean;
  backupLlmProvider: string | null;
  backupLlmModel: string | null;
  silenceTimeout: number;
  endCallOnGoodbye: boolean;
  thinkingBudget: string | null;
  knowledgeBaseId: string | null;
}

interface Conversation {
  id: string;
  mode: string;
  status: string;
  duration: number | null;
  callerName: string | null;
  callerEmail: string | null;
  callerPhone: string | null;
  summary: string | null;
  sentiment: string | null;
  source: string;
  createdAt: string;
  endedAt: string | null;
  messages: { id: string; role: string; content: string; audioUrl?: string; isVoiceInput?: boolean; createdAt: string }[];
  messageCount: number;
  evaluation: { total: number; passed: number; passRate: number } | null;
  intelligence: ConversationIntelligence | null;
}

interface Document {
  id: string;
  name: string;
  type: string;
  fileSize: number | null;
  charCount: number;
  status: string;
  createdAt: string;
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: agentId } = use(params);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAnalysis, setIsSavingAnalysis] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editable agent settings - Agent Tab
  const [systemPrompt, setSystemPrompt] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [llmProvider, setLlmProvider] = useState("openai");
  const [llmModel, setLlmModel] = useState("gpt-4o");
  const [language, setLanguage] = useState("en");
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [allowInterrupt, setAllowInterrupt] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceStability, setVoiceStability] = useState(50);
  const [voiceSimilarityBoost, setVoiceSimilarityBoost] = useState(75);
  const [enableBackupLlm, setEnableBackupLlm] = useState(true);
  const [backupLlmProvider, setBackupLlmProvider] = useState("openai");
  const [backupLlmModel, setBackupLlmModel] = useState("gpt-4o-mini");
  const [silenceTimeout, setSilenceTimeout] = useState(5);
  const [thinkingBudget, setThinkingBudget] = useState<string | null>(null);

  // Settings Tab
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [isActive, setIsActive] = useState(true);
  const [voiceStyleExaggeration, setVoiceStyleExaggeration] = useState(0);
  const [voiceSpeakerBoost, setVoiceSpeakerBoost] = useState(false);
  const [endCallOnGoodbye, setEndCallOnGoodbye] = useState(false);

  // Analysis settings
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriterion[]>([]);
  const [dataCollectionPoints, setDataCollectionPoints] = useState<DataCollectionPoint[]>([]);
  const [analysisLanguage, setAnalysisLanguage] = useState("auto");
  const [enableAnalysis, setEnableAnalysis] = useState(true);

  useEffect(() => { fetchAgent(); }, [agentId]);

  const fetchAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch agent");
      const data = await response.json();
      setAgent(data);

      setSystemPrompt(data.systemPrompt || "");
      setFirstMessage(data.firstMessage || "");
      setUserPrompt(data.userPrompt || "");
      setLlmProvider(data.llmProvider || "openai");
      setLlmModel(data.llmModel || "gpt-4o");
      setLanguage(data.language || "en");
      setVoiceId(data.voiceId);
      setAllowInterrupt(data.allowInterrupt ?? true);
      setVoiceEnabled(data.voiceEnabled ?? true);
      setVoiceStability(data.voiceStability ?? 50);
      setVoiceSimilarityBoost(data.voiceSimilarityBoost ?? 75);
      setEnableBackupLlm(data.enableBackupLlm ?? true);
      setBackupLlmProvider(data.backupLlmProvider || "openai");
      setBackupLlmModel(data.backupLlmModel || "gpt-4o-mini");
      setSilenceTimeout(data.silenceTimeout ?? 5);
      setThinkingBudget(data.thinkingBudget || null);
      setEvaluationCriteria(data.evaluationCriteria || []);
      setDataCollectionPoints(data.dataCollectionPoints || []);
      setAnalysisLanguage(data.analysisLanguage || "auto");
      setEnableAnalysis(data.enableAnalysis ?? true);
      
      // Settings tab data
      setAgentName(data.name || "");
      setAgentDescription(data.description || null);
      setTemperature(data.temperature ?? 0.7);
      setIsActive(data.isActive ?? true);
      setVoiceStyleExaggeration(data.voiceStyleExaggeration ?? 0);
      setVoiceSpeakerBoost(data.voiceSpeakerBoost ?? false);
      setEndCallOnGoodbye(data.endCallOnGoodbye ?? false);

      const convResponse = await fetch(`/api/agents/${agentId}/conversations`, { credentials: "include" });
      if (convResponse.ok) {
        const convData = await convResponse.json();
        setConversations(convData.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching agent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKnowledgeBaseChange = (kbId: string | null) => {
    if (agent) {
      setAgent({ ...agent, knowledgeBaseId: kbId });
    }
  };

  const handleSaveAgent = async () => {
    if (!agent) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt, firstMessage, userPrompt, llmProvider, llmModel, language, voiceId, allowInterrupt,
          voiceEnabled, voiceStability, voiceSimilarityBoost,
          enableBackupLlm, backupLlmProvider, backupLlmModel, silenceTimeout, thinkingBudget,
        }),
      });
      if (!response.ok) throw new Error("Failed to save");
      const updatedAgent = await response.json();
      setAgent({ ...agent, ...updatedAgent });
    } catch (error) {
      console.error("Error saving agent:", error);
      alert("Failed to save agent settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!agent) return;
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/agents/${agent.id}/publish`, { method: "POST", credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAgent({ ...agent, isPublic: true, publicId: data.publicId, publishedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Error publishing:", error);
      alert("Failed to publish agent");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!agent) return;
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/agents/${agent.id}/publish`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to unpublish");
      setAgent({ ...agent, isPublic: false, publishedAt: null });
    } catch (error) {
      console.error("Error unpublishing:", error);
      alert("Failed to unpublish agent");
    } finally {
      setIsPublishing(false);
    }
  };

  const copyPublicUrl = () => {
    if (!agent?.publicId) return;
    navigator.clipboard.writeText(`${window.location.origin}/consult/${agent.publicId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfiguration = async () => {
    if (!agent) return;
    setIsSavingConfig(true);
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName,
          description: agentDescription,
          temperature,
          isActive,
          voiceStability,
          voiceSimilarityBoost,
          voiceStyleExaggeration,
          voiceSpeakerBoost,
          silenceTimeout,
          endCallOnGoodbye,
          enableBackupLlm,
          backupLlmProvider,
          backupLlmModel,
          thinkingBudget,
        }),
      });
      if (!response.ok) throw new Error("Failed to save configuration");
      const updatedAgent = await response.json();
      setAgent({ ...agent, ...updatedAgent });
    } catch (error) {
      console.error("Error saving configuration:", error);
      alert("Failed to save configuration");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const saveAnalysisSettings = async () => {
    if (!agent) return;
    setIsSavingAnalysis(true);
    try {
      const response = await fetch(`/api/agents/${agent.id}/analysis`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisLanguage, enableAnalysis,
          evaluationCriteria: evaluationCriteria.map(c => ({
            id: c.id.startsWith("criterion-") ? undefined : c.id,
            name: c.name, description: c.description, prompt: c.prompt, type: c.type, isActive: c.isActive,
          })),
          dataCollectionPoints: dataCollectionPoints.map(d => ({
            id: d.id.startsWith("datapoint-") ? undefined : d.id,
            name: d.name, description: d.description, dataType: d.dataType, prompt: d.prompt,
            isRequired: d.isRequired, isActive: d.isActive,
          })),
        }),
      });
      if (!response.ok) throw new Error("Failed to save analysis settings");
      const updatedData = await response.json();
      setEvaluationCriteria(updatedData.evaluationCriteria || []);
      setDataCollectionPoints(updatedData.dataCollectionPoints || []);
    } catch (error) {
      console.error("Error saving analysis:", error);
      alert("Failed to save analysis settings");
    } finally {
      setIsSavingAnalysis(false);
    }
  };

  const getEmbedCode = () => {
    if (!agent?.publicId) return "";
    const url = `${window.location.origin}/consult/${agent.publicId}`;
    return `<script>\n(function(){var i=document.createElement('iframe');i.src='${url}?embed=true';i.style='position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9999';document.body.appendChild(i)})();\n</script>`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <HeartPulse className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Agent not found</p>
        <Link href="/agents">
          <Button variant="link" className="text-gray-600 mt-2">Back to Agents</Button>
        </Link>
      </div>
    );
  }

  const publicUrl = agent.publicId ? `${window.location.origin}/consult/${agent.publicId}` : null;
  const tabStyle = "relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200";

  return (
    <div className="space-y-0">
      {/* Header — matches ElevenLabs: name / Main  Live badge  ... right-side buttons */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Link href="/agents" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            {agent.name}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">Main</span>
          {agent.isPublic && (
            <Badge className="ml-2 bg-emerald-100 text-emerald-700 border-0 text-xs font-medium px-2 py-0.5">
              Live 100%
            </Badge>
          )}
          {agent.isPublic && (
            <button onClick={copyPublicUrl} className="ml-1 text-gray-400 hover:text-gray-600 transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {agent.isPublic && (
            <span className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-1">Public</span>
          )}
          <Link href={`/agents/${agentId}/chat`}>
            <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 h-8 text-xs">
              Preview
            </Button>
          </Link>
          {agent.isPublic ? (
            <Button onClick={handleUnpublish} disabled={isPublishing} size="sm" variant="outline" className="border-red-200 text-red-600 h-8 text-xs hover:bg-red-50">
              {isPublishing && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}Unpublish
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={isPublishing} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs">
              {isPublishing && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}Publish
            </Button>
          )}
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Intelligence Overview */}
      {conversations.filter(c => c.intelligence !== null).length > 0 && (
        <Card className="mb-6 bg-white border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-purple-600" />
              Conversation Intelligence Overview
            </CardTitle>
            <CardDescription className="text-xs">
              Psychological insights from {conversations.filter(c => c.intelligence !== null).length} analyzed conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntelligenceSummary
              conversations={conversations.map(c => ({
                id: c.id,
                createdAt: c.createdAt,
                intelligence: c.intelligence,
              }))}
              variant="compact"
            />
          </CardContent>
        </Card>
      )}

      {/* Tabs — improved design */}
      <Tabs defaultValue="agent" className="space-y-6">
        <TabsList className="bg-gray-50 rounded-lg p-1 h-auto gap-1 w-fit">
          <TabsTrigger value="agent" className={tabStyle}>Agent</TabsTrigger>
          <TabsTrigger value="settings" className={tabStyle}>Settings</TabsTrigger>
          <TabsTrigger value="knowledge" className={tabStyle}>Knowledge Base</TabsTrigger>
          <TabsTrigger value="analysis" className={tabStyle}>Analysis</TabsTrigger>
          <TabsTrigger value="tools" className={tabStyle}>Tools</TabsTrigger>
          <TabsTrigger value="widget" className={tabStyle}>Widget</TabsTrigger>
          <TabsTrigger value="conversations" className={tabStyle}>
            Conversations
            {conversations.length > 0 && (
              <span className="ml-1.5 text-[10px] opacity-70">{conversations.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Agent Tab */}
        <TabsContent value="agent">
          <AgentSettingsTab
            systemPrompt={systemPrompt} setSystemPrompt={setSystemPrompt}
            firstMessage={firstMessage} setFirstMessage={setFirstMessage}
            userPrompt={userPrompt} setUserPrompt={setUserPrompt}
            llmProvider={llmProvider} setLlmProvider={setLlmProvider}
            llmModel={llmModel} setLlmModel={setLlmModel}
            language={language} setLanguage={setLanguage}
            voiceId={voiceId} setVoiceId={setVoiceId}
            voiceEnabled={voiceEnabled} setVoiceEnabled={setVoiceEnabled}
            voiceStability={voiceStability} setVoiceStability={setVoiceStability}
            voiceSimilarityBoost={voiceSimilarityBoost} setVoiceSimilarityBoost={setVoiceSimilarityBoost}
            allowInterrupt={allowInterrupt} setAllowInterrupt={setAllowInterrupt}
            silenceTimeout={silenceTimeout} setSilenceTimeout={setSilenceTimeout}
            enableBackupLlm={enableBackupLlm} setEnableBackupLlm={setEnableBackupLlm}
            backupLlmProvider={backupLlmProvider} setBackupLlmProvider={setBackupLlmProvider}
            backupLlmModel={backupLlmModel} setBackupLlmModel={setBackupLlmModel}
            thinkingBudget={thinkingBudget} setThinkingBudget={setThinkingBudget}
            isSaving={isSaving} onSave={handleSaveAgent}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <AgentConfigurationTab
            name={agentName} setName={setAgentName}
            description={agentDescription} setDescription={setAgentDescription}
            temperature={temperature} setTemperature={setTemperature}
            isActive={isActive} setIsActive={setIsActive}
            voiceStability={voiceStability} setVoiceStability={setVoiceStability}
            voiceSimilarityBoost={voiceSimilarityBoost} setVoiceSimilarityBoost={setVoiceSimilarityBoost}
            voiceStyleExaggeration={voiceStyleExaggeration} setVoiceStyleExaggeration={setVoiceStyleExaggeration}
            voiceSpeakerBoost={voiceSpeakerBoost} setVoiceSpeakerBoost={setVoiceSpeakerBoost}
            silenceTimeout={silenceTimeout} setSilenceTimeout={setSilenceTimeout}
            endCallOnGoodbye={endCallOnGoodbye} setEndCallOnGoodbye={setEndCallOnGoodbye}
            enableBackupLlm={enableBackupLlm} setEnableBackupLlm={setEnableBackupLlm}
            backupLlmProvider={backupLlmProvider} setBackupLlmProvider={setBackupLlmProvider}
            backupLlmModel={backupLlmModel} setBackupLlmModel={setBackupLlmModel}
            thinkingBudget={thinkingBudget} setThinkingBudget={setThinkingBudget}
            isSaving={isSavingConfig} onSave={handleSaveConfiguration}
          />
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge">
          <KnowledgeBaseTab
            agentId={agentId}
            currentKnowledgeBaseId={agent.knowledgeBaseId}
            onKnowledgeBaseChange={handleKnowledgeBaseChange}
          />
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <AnalysisResultsTab
            agentId={agentId}
            evaluationCriteria={evaluationCriteria}
            dataCollectionPoints={dataCollectionPoints}
            analysisLanguage={analysisLanguage}
            enableAnalysis={enableAnalysis}
            onEvaluationCriteriaChange={setEvaluationCriteria}
            onDataCollectionPointsChange={setDataCollectionPoints}
            onAnalysisLanguageChange={setAnalysisLanguage}
            onEnableAnalysisChange={setEnableAnalysis}
            isSavingAnalysis={isSavingAnalysis}
            onSaveAnalysis={saveAnalysisSettings}
          />
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools">
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="text-center py-16">
              <Wrench className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-4">No tools configured</p>
              <Button variant="outline" size="sm" className="text-xs">Add Tool</Button>
            </div>
          </div>
        </TabsContent>

        {/* Widget Tab */}
        <TabsContent value="widget">
          <div className="border border-gray-200 rounded-lg bg-white">
            {agent.isPublic ? (
              <div className="p-6 space-y-6">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium">Your agent is live!</p>
                  <p className="text-sm text-emerald-600 mt-1">
                    Public URL: <a href={publicUrl || ""} target="_blank" className="underline">{publicUrl}</a>
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Embed Code</label>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">{getEmbedCode()}</pre>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    navigator.clipboard.writeText(getEmbedCode());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}>
                    {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                    {copied ? "Copied!" : "Copy Code"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Globe className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 mb-4">Publish your agent to get the embed code</p>
                <Button onClick={handlePublish} disabled={isPublishing} size="sm">
                  {isPublishing && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}Publish Agent
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="conversations">
          <ConversationsTab
            agentId={agentId}
            agentName={agent.name}
            conversations={conversations as any}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
