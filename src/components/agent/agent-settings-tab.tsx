"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { VoicePicker } from "@/components/agent/voice-picker";


const llmProviders = [
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "o1", "o1-mini"] },
  { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4.5", "claude-sonnet-4", "claude-3.5-sonnet", "claude-3-opus", "claude-3-haiku"], supportsThinking: true },
  { id: "google", name: "Google", models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro"] },
];

interface AgentSettingsTabProps {
  systemPrompt: string;
  setSystemPrompt: (v: string) => void;
  firstMessage: string;
  setFirstMessage: (v: string) => void;
  userPrompt: string;
  setUserPrompt: (v: string) => void;
  llmProvider: string;
  setLlmProvider: (v: string) => void;
  llmModel: string;
  setLlmModel: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  voiceId: string | null;
  setVoiceId: (v: string | null) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
  voiceStability: number;
  setVoiceStability: (v: number) => void;
  voiceSimilarityBoost: number;
  setVoiceSimilarityBoost: (v: number) => void;
  allowInterrupt: boolean;
  setAllowInterrupt: (v: boolean) => void;
  silenceTimeout: number;
  setSilenceTimeout: (v: number) => void;
  enableBackupLlm: boolean;
  setEnableBackupLlm: (v: boolean) => void;
  backupLlmProvider: string;
  setBackupLlmProvider: (v: string) => void;
  backupLlmModel: string;
  setBackupLlmModel: (v: string) => void;
  thinkingBudget: string | null;
  setThinkingBudget: (v: string | null) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function AgentSettingsTab(props: AgentSettingsTabProps) {
  const {
    systemPrompt, setSystemPrompt, firstMessage, setFirstMessage, userPrompt, setUserPrompt,
    llmProvider, setLlmProvider, llmModel, setLlmModel,
    language, setLanguage, voiceId, setVoiceId,
    voiceEnabled, setVoiceEnabled,
    allowInterrupt, setAllowInterrupt,
    enableBackupLlm, setEnableBackupLlm, backupLlmProvider, setBackupLlmProvider,
    backupLlmModel, setBackupLlmModel, thinkingBudget, setThinkingBudget,
    isSaving, onSave,
  } = props;

  const selectedProvider = llmProviders.find(p => p.id === llmProvider);

  return (
    <div className="flex gap-6">
      {/* LEFT: System prompt + First message */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* System prompt */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">System prompt</h3>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter the system prompt..."
            className="min-h-[360px] font-mono text-sm bg-white border-gray-200 resize-y"
          />
          <p className="text-[11px] text-gray-400 mt-1.5">Type {"{{ }}"} to add variables</p>
        </div>

        {/* User prompt */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">User prompt</h3>
          <p className="text-[11px] text-gray-400 mb-2">An optional prompt sent as the first user message at the start of the conversation.</p>
          <Textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Enter the user prompt..."
            className="min-h-[80px] bg-white border-gray-200 resize-y"
          />
        </div>

        {/* First message */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">First message</h3>
          <p className="text-[11px] text-gray-400 mb-2">The message the agent will say. If empty, the agent will wait for the user to start the conversation.</p>
          <Textarea
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            placeholder="Enter the first message..."
            className="min-h-[80px] bg-white border-gray-200 resize-y"
          />
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <Switch checked={allowInterrupt} onCheckedChange={setAllowInterrupt} />
              <Label className="text-xs text-gray-600">Interruptable</Label>
            </div>
          </div>
        </div>

        {/* Save button at bottom left */}
        <Button onClick={onSave} disabled={isSaving} className="bg-gray-900 hover:bg-gray-800 text-white">
          {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
        </Button>
      </div>

      {/* RIGHT: Voice, Language, LLM */}
      <div className="w-[300px] shrink-0 space-y-5">
        {/* Voice */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Voice</h3>
          <p className="text-[11px] text-gray-400 mb-3">Select the voice used to talk to the user.</p>
          <VoicePicker value={voiceId} onChange={setVoiceId} />
          <div className="flex items-center gap-2 mt-3">
            <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
            <Label className="text-xs text-gray-600">Voice enabled</Label>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Language</h3>
          <p className="text-[11px] text-gray-400 mb-3">Configure default and additional languages.</p>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-white border-gray-200 h-9 text-xs"><SelectValue placeholder="Select language" /></SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="ko">Korean</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* LLM */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">LLM</h3>
          <p className="text-[11px] text-gray-400 mb-3">Select a model provider and model to use for this agent.</p>
          <div className="space-y-3">
            <Select value={llmProvider} onValueChange={(v) => {
              setLlmProvider(v);
              const provider = llmProviders.find(p => p.id === v);
              if (provider?.models[0]) setLlmModel(provider.models[0]);
            }}>
              <SelectTrigger className="bg-white border-gray-200 h-9 text-xs"><SelectValue placeholder="Select provider" /></SelectTrigger>
              <SelectContent className="bg-white">
                {llmProviders.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={llmModel} onValueChange={setLlmModel}>
              <SelectTrigger className="bg-white border-gray-200 h-9 text-xs"><SelectValue placeholder="Select model" /></SelectTrigger>
              <SelectContent className="bg-white">
                {selectedProvider?.models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>

            {llmProvider === "anthropic" && (
              <div className="pt-2 border-t border-gray-100">
                <Label className="text-[11px] text-gray-500">Extended Thinking</Label>
                <Select value={thinkingBudget || "disabled"} onValueChange={(v) => setThinkingBudget(v === "disabled" ? null : v)}>
                  <SelectTrigger className="bg-white border-gray-200 h-9 text-xs mt-1"><SelectValue placeholder="Disabled" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Backup model */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-700">Backup model</Label>
              <Switch checked={enableBackupLlm} onCheckedChange={setEnableBackupLlm} />
            </div>
            {enableBackupLlm && (
              <div className="space-y-2">
                <Select value={backupLlmProvider} onValueChange={(v) => {
                  setBackupLlmProvider(v);
                  const provider = llmProviders.find(p => p.id === v);
                  if (provider?.models[0]) setBackupLlmModel(provider.models[0]);
                }}>
                  <SelectTrigger className="bg-white border-gray-200 h-9 text-xs"><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {llmProviders.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={backupLlmModel} onValueChange={setBackupLlmModel}>
                  <SelectTrigger className="bg-white border-gray-200 h-9 text-xs"><SelectValue placeholder="Select model" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {llmProviders.find(p => p.id === backupLlmProvider)?.models.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
