"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Settings2 } from "lucide-react";

const llmProviders = [
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "o1", "o1-mini"] },
  { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4.5", "claude-sonnet-4", "claude-3.5-sonnet", "claude-3-opus", "claude-3-haiku"], supportsThinking: true },
  { id: "google", name: "Google", models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro"] },
];

interface AgentConfigurationTabProps {
  name: string;
  setName: (v: string) => void;
  description: string | null;
  setDescription: (v: string | null) => void;
  temperature: number;
  setTemperature: (v: number) => void;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  voiceStability: number;
  setVoiceStability: (v: number) => void;
  voiceSimilarityBoost: number;
  setVoiceSimilarityBoost: (v: number) => void;
  voiceStyleExaggeration: number;
  setVoiceStyleExaggeration: (v: number) => void;
  voiceSpeakerBoost: boolean;
  setVoiceSpeakerBoost: (v: boolean) => void;
  silenceTimeout: number;
  setSilenceTimeout: (v: number) => void;
  endCallOnGoodbye: boolean;
  setEndCallOnGoodbye: (v: boolean) => void;
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

export function AgentConfigurationTab(props: AgentConfigurationTabProps) {
  const {
    name, setName, description, setDescription,
    temperature, setTemperature, isActive, setIsActive,
    voiceStability, setVoiceStability,
    voiceSimilarityBoost, setVoiceSimilarityBoost,
    voiceStyleExaggeration, setVoiceStyleExaggeration,
    voiceSpeakerBoost, setVoiceSpeakerBoost,
    silenceTimeout, setSilenceTimeout,
    endCallOnGoodbye, setEndCallOnGoodbye,
    enableBackupLlm, setEnableBackupLlm,
    backupLlmProvider, setBackupLlmProvider,
    backupLlmModel, setBackupLlmModel,
    thinkingBudget, setThinkingBudget,
    isSaving, onSave,
  } = props;

  const backupProvider = llmProviders.find(p => p.id === backupLlmProvider);
  const supportsThinking = backupProvider?.supportsThinking;

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            General Settings
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Configure basic agent information and behavior</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1.5 block">Agent Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Agent"
                className="h-9 text-sm bg-white border-gray-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium text-gray-700 block">Agent Status</Label>
                <p className="text-[11px] text-gray-400">Enable or disable this agent</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1.5 block">Description</Label>
            <Textarea
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this agent does..."
              className="min-h-[80px] text-sm bg-white border-gray-200 resize-none"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">
              Temperature: {temperature.toFixed(2)}
            </Label>
            <Slider
              value={[temperature * 100]}
              onValueChange={([v]) => setTemperature(v / 100)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Higher values make responses more creative, lower values more focused
            </p>
          </div>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Voice Settings</h3>
          <p className="text-xs text-gray-500 mt-0.5">Fine-tune voice characteristics and quality</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">
              Stability: {voiceStability}%
            </Label>
            <Slider
              value={[voiceStability]}
              onValueChange={([v]) => setVoiceStability(v)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Lower values add more variability and expressiveness
            </p>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">
              Similarity Boost: {voiceSimilarityBoost}%
            </Label>
            <Slider
              value={[voiceSimilarityBoost]}
              onValueChange={([v]) => setVoiceSimilarityBoost(v)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Higher values preserve the original voice characteristics more closely
            </p>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">
              Style Exaggeration: {voiceStyleExaggeration}%
            </Label>
            <Slider
              value={[voiceStyleExaggeration]}
              onValueChange={([v]) => setVoiceStyleExaggeration(v)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Amplifies the style of the original voice
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label className="text-xs font-medium text-gray-700 block">Speaker Boost</Label>
              <p className="text-[11px] text-gray-400">Enhance voice clarity for noisy environments</p>
            </div>
            <Switch checked={voiceSpeakerBoost} onCheckedChange={setVoiceSpeakerBoost} />
          </div>
        </div>
      </div>

      {/* Conversation Settings */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Conversation Settings</h3>
          <p className="text-xs text-gray-500 mt-0.5">Control conversation flow and behavior</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Silence Timeout (seconds): {silenceTimeout}s
            </Label>
            <Slider
              value={[silenceTimeout]}
              onValueChange={([v]) => setSilenceTimeout(v)}
              min={1}
              max={30}
              step={1}
              className="w-full"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              How long to wait for user input before timing out
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label className="text-xs font-medium text-gray-700 block">End Call on Goodbye</Label>
              <p className="text-[11px] text-gray-400">Automatically end conversation when user says goodbye</p>
            </div>
            <Switch checked={endCallOnGoodbye} onCheckedChange={setEndCallOnGoodbye} />
          </div>
        </div>
      </div>

      {/* Backup LLM */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Backup LLM</h3>
          <p className="text-xs text-gray-500 mt-0.5">Fallback model if primary LLM fails</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-xs font-medium text-gray-700 block">Enable Backup LLM</Label>
              <p className="text-[11px] text-gray-400">Use a fallback model for reliability</p>
            </div>
            <Switch checked={enableBackupLlm} onCheckedChange={setEnableBackupLlm} />
          </div>

          {enableBackupLlm && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1.5 block">Provider</Label>
                <Select value={backupLlmProvider} onValueChange={(v) => {
                  setBackupLlmProvider(v);
                  const provider = llmProviders.find(p => p.id === v);
                  if (provider?.models[0]) setBackupLlmModel(provider.models[0]);
                }}>
                  <SelectTrigger className="w-full bg-white border-gray-200 h-9 text-xs">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {llmProviders.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1.5 block">Model</Label>
                <Select value={backupLlmModel} onValueChange={setBackupLlmModel}>
                  <SelectTrigger className="w-full bg-white border-gray-200 h-9 text-xs">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {backupProvider?.models.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {supportsThinking && (
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-1.5 block">Thinking Budget</Label>
                  <Input
                    value={thinkingBudget || ""}
                    onChange={(e) => setThinkingBudget(e.target.value || null)}
                    placeholder="e.g., 10000"
                    className="h-9 text-sm bg-white border-gray-200"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Maximum thinking tokens for reasoning models (optional)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving} className="bg-gray-900 hover:bg-gray-800 text-white">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
