"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Database,
  Loader2,
  Bot,
  Briefcase,
  UserCircle,
  Sparkles,
  MessageSquare,
  Settings,
  Mic,
  Brain,
  BarChart3,
  Play,
  Pause,
  Volume2,
  Zap,
  Clock,
  Shield,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnalysisSettings,
  type EvaluationCriterion,
  type DataCollectionPoint,
} from "@/components/agent/analysis-settings";

const steps = [
  { id: "basic", name: "Basic Info", icon: Bot },
  { id: "prompt", name: "Prompts", icon: MessageSquare },
  { id: "voice", name: "Voice & Language", icon: Mic },
  { id: "knowledge", name: "Knowledge Base", icon: BarChart3 },
  { id: "llm", name: "LLM Settings", icon: Brain },
  { id: "advanced", name: "Advanced", icon: Zap },
  { id: "analysis", name: "Analysis", icon: BarChart3 },
  { id: "review", name: "Review", icon: Check },
];

const agentTypes = [
  {
    id: "blank",
    name: "Blank Agent",
    description: "Start from scratch with a custom configuration",
    icon: Bot,
    systemPrompt: "",
    firstMessage: "",
  },
  {
    id: "assistant",
    name: "Personal Assistant",
    description: "A helpful personal assistant for various tasks",
    icon: UserCircle,
    systemPrompt: `# Personality
You are a helpful personal assistant. You are friendly, efficient, and attentive to detail.

# Goal
Your role is to:
- Help users with their questions and tasks
- Provide clear and accurate information
- Be proactive in offering assistance
- Maintain a professional yet approachable tone

Always be helpful and courteous in your interactions.`,
    firstMessage: "Hi there! I'm your personal assistant. How can I help you today?",
  },
  {
    id: "business",
    name: "Business Agent",
    description: "Professional agent for customer service and sales",
    icon: Briefcase,
    systemPrompt: `# Personality
You are a professional business agent specializing in customer service and sales support.

# Goal
Your role is to:
- Answer customer questions about products and services
- Assist with purchases and order inquiries
- Provide accurate pricing and availability information
- Handle complaints professionally and empathetically
- Escalate complex issues when necessary

Always maintain a professional and helpful demeanor.`,
    firstMessage: "Hello! Welcome to our service. How may I assist you today?",
  },
  {
    id: "medical",
    name: "Medical Assistant",
    description: "Healthcare-focused AI for patient support",
    icon: Sparkles,
    systemPrompt: `# Personality
You are a professional medical AI assistant.

# Goal
Your role is to:
- Provide helpful, accurate health information
- Never diagnose conditions - always recommend consulting a healthcare provider
- Be empathetic and supportive
- Remind patients about the importance of professional medical advice

# Guardrails
Always include appropriate disclaimers and encourage users to seek professional medical help for serious concerns.`,
    firstMessage: "Hello! I'm your medical assistant. How can I help you with your health questions today?",
  },
];

// Updated LLM providers with latest models
const llmProviders = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "Most capable, multimodal" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "High performance" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fast, cost-effective" },
    ],
    supportsThinking: false,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      { id: "claude-sonnet-4", name: "Claude Sonnet 4", description: "Best for most tasks" },
      { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", description: "Latest and most capable" },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", description: "Fast and efficient" },
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", description: "Excellent reasoning" },
      { id: "claude-3-haiku", name: "Claude 3 Haiku", description: "Fastest responses" },
    ],
    supportsThinking: true,
  },
  {
    id: "google",
    name: "Google",
    models: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast with great quality" },
      { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", description: "Ultra-fast responses" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Balanced performance" },
      { id: "gemini-pro", name: "Gemini Pro", description: "General purpose" },
    ],
    supportsThinking: false,
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    models: [
      { id: "glm-4.5-air", name: "GLM-4.5-Air", description: "ElevenLabs optimized" },
      { id: "qwen3-30b", name: "Qwen3-30B", description: "High quality responses" },
    ],
    supportsThinking: false,
  },
];

// Voice options with preview configuration
const voices = [
  {
    id: "rachel",
    name: "Rachel",
    description: "Calm, professional female voice",
    accent: "American",
    gender: "Female",
    previewText: "Hello! I'm Rachel, your professional assistant. How can I help you today?",
    pitch: 1.1,
    rate: 0.95,
  },
  {
    id: "drew",
    name: "Drew",
    description: "Confident, friendly male voice",
    accent: "American",
    gender: "Male",
    previewText: "Hey there! I'm Drew. I'm here to help you with anything you need.",
    pitch: 0.9,
    rate: 1.0,
  },
  {
    id: "clyde",
    name: "Clyde",
    description: "Deep, authoritative male voice",
    accent: "American",
    gender: "Male",
    previewText: "Good day. I'm Clyde. How may I assist you with your inquiry?",
    pitch: 0.7,
    rate: 0.9,
  },
  {
    id: "paul",
    name: "Paul",
    description: "Warm, conversational male voice",
    accent: "American",
    gender: "Male",
    previewText: "Hi! I'm Paul. It's great to meet you. What can I do for you?",
    pitch: 1.0,
    rate: 1.0,
  },
  {
    id: "domi",
    name: "Domi",
    description: "Energetic, youthful female voice",
    accent: "American",
    gender: "Female",
    previewText: "Hey! I'm Domi! Super excited to help you out today!",
    pitch: 1.3,
    rate: 1.1,
  },
  {
    id: "dave",
    name: "Dave",
    description: "Casual, approachable male voice",
    accent: "British",
    gender: "Male",
    previewText: "Hello there! I'm Dave. Lovely to meet you. How can I be of service?",
    pitch: 0.95,
    rate: 0.95,
  },
  {
    id: "fin",
    name: "Fin",
    description: "Sophisticated, mature male voice",
    accent: "Irish",
    gender: "Male",
    previewText: "Top of the morning! I'm Fin. What can I help you with today?",
    pitch: 0.85,
    rate: 0.9,
  },
  {
    id: "sarah",
    name: "Sarah",
    description: "Soft, soothing female voice",
    accent: "American",
    gender: "Female",
    previewText: "Hello, I'm Sarah. I'm here to help you in any way I can.",
    pitch: 1.2,
    rate: 0.85,
  },
];

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
];

// Ambient sounds for tool calls
const ambientSounds = [
  { id: "none", name: "None", description: "No ambient sound" },
  { id: "office", name: "Office", description: "Subtle office ambiance" },
  { id: "keyboard", name: "Keyboard", description: "Typing sounds" },
  { id: "processing", name: "Processing", description: "Digital processing sounds" },
  { id: "nature", name: "Nature", description: "Calm nature sounds" },
];

export default function NewAgentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [userPrompt, setUserPrompt] = useState("");

  // Knowledge Base state
  const [knowledgeBases, setKnowledgeBases] = useState<{ id: string; name: string; description: string | null; category: string; documentCount: number }[]>([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null);
  const [isLoadingKBs, setIsLoadingKBs] = useState(false);

  // Voice state
  const [voiceEnabled, setVoiceEnabled] = useState(true); // true = both voice & text, false = text only
  const [voiceId, setVoiceId] = useState("rachel");
  const [language, setLanguage] = useState("en");
  const [stability, setStability] = useState(50);
  const [similarityBoost, setSimilarityBoost] = useState(75);
  const [styleExaggeration, setStyleExaggeration] = useState(0);
  const [speakerBoost, setSpeakerBoost] = useState(true);

  // LLM state
  const [llmProvider, setLlmProvider] = useState("openai");
  const [llmModel, setLlmModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [thinkingBudget, setThinkingBudget] = useState("disabled");

  // Backup LLM
  const [enableBackupLlm, setEnableBackupLlm] = useState(true);
  const [backupLlmProvider, setBackupLlmProvider] = useState("openai");
  const [backupLlmModel, setBackupLlmModel] = useState("gpt-4o-mini");

  // Advanced / Conversation Flow state
  const [allowInterrupt, setAllowInterrupt] = useState(true);
  const [turnTaking, setTurnTaking] = useState("auto");
  const [silenceTimeout, setSilenceTimeout] = useState(5);
  const [responseTimeout, setResponseTimeout] = useState(30);
  const [maxDuration, setMaxDuration] = useState(600);
  const [ambientSound, setAmbientSound] = useState("none");
  const [endCallOnGoodbye, setEndCallOnGoodbye] = useState(true);

  // Analysis state
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriterion[]>([]);
  const [dataCollectionPoints, setDataCollectionPoints] = useState<DataCollectionPoint[]>([]);
  const [analysisLanguage, setAnalysisLanguage] = useState("auto");
  const [enableAnalysis, setEnableAnalysis] = useState(true);

  // Load speech synthesis voices on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Some browsers need this to load voices
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    // Fetch knowledge bases
    fetchKnowledgeBases();

    // Cleanup: stop any speech when component unmounts
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fetchKnowledgeBases = async () => {
    setIsLoadingKBs(true);
    try {
      const response = await fetch("/api/knowledge");
      if (response.ok) {
        const data = await response.json();
        setKnowledgeBases(data.knowledgeBases || []);
      }
    } catch (error) {
      console.error("Failed to fetch knowledge bases:", error);
    } finally {
      setIsLoadingKBs(false);
    }
  };

  const selectedProviderData = llmProviders.find((p) => p.id === llmProvider);
  const selectedBackupProviderData = llmProviders.find((p) => p.id === backupLlmProvider);
  const selectedVoice = voices.find((v) => v.id === voiceId);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return name.trim().length > 0;        // Basic Info
      case 1: return systemPrompt.trim().length > 0; // System Prompt
      case 2: return true;                            // Voice & Language
      case 3: return true;                            // Knowledge Base
      case 4: return true;                            // LLM Settings
      case 5: return true;                            // Advanced
      case 6: return true;                            // Analysis
      case 7: return true;                            // Review
      default: return false;
    }
  };

  const playVoicePreview = (voice: typeof voices[0]) => {
    // Stop any currently playing speech
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (playingVoice === voice.id) {
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voice.id);

    // Use Web Speech API for voice preview
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(voice.previewText);

      // Get available voices and try to match gender
      const availableVoices = window.speechSynthesis.getVoices();
      const matchingVoice = availableVoices.find(v => {
        const voiceName = v.name.toLowerCase();
        if (voice.gender === "Female") {
          return voiceName.includes("female") || voiceName.includes("samantha") ||
                 voiceName.includes("victoria") || voiceName.includes("karen") ||
                 voiceName.includes("zira") || voiceName.includes("hazel");
        } else {
          return voiceName.includes("male") || voiceName.includes("daniel") ||
                 voiceName.includes("alex") || voiceName.includes("david") ||
                 voiceName.includes("james") || voiceName.includes("mark");
        }
      });

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.pitch = voice.pitch;
      utterance.rate = voice.rate;
      utterance.volume = 1;

      utterance.onend = () => {
        setPlayingVoice(null);
      };

      utterance.onerror = () => {
        setPlayingVoice(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback if speech synthesis not available
      setTimeout(() => {
        setPlayingVoice(null);
      }, 2000);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          systemPrompt,
          firstMessage,
          userPrompt,
          voiceEnabled,
          voiceId: voiceEnabled ? voiceId : null,
          language,
          knowledgeBaseId: selectedKnowledgeBase,
          // Voice settings
          voiceStability: stability,
          voiceSimilarityBoost: similarityBoost,
          voiceStyleExaggeration: styleExaggeration,
          voiceSpeakerBoost: speakerBoost,
          // LLM settings
          llmProvider,
          llmModel,
          temperature,
          maxTokens,
          thinkingBudget: thinkingBudget === "disabled" ? null : thinkingBudget,
          // Backup LLM
          enableBackupLlm,
          backupLlmProvider: enableBackupLlm ? backupLlmProvider : null,
          backupLlmModel: enableBackupLlm ? backupLlmModel : null,
          // Conversation flow
          allowInterrupt,
          turnTaking,
          silenceTimeout,
          responseTimeout,
          maxDuration,
          ambientSound: ambientSound === "none" ? null : ambientSound,
          endCallOnGoodbye,
          // Analysis
          analysisLanguage,
          enableAnalysis,
          evaluationCriteria: evaluationCriteria.map(c => ({
            name: c.name,
            description: c.description,
            prompt: c.prompt,
            type: c.type,
            isActive: c.isActive,
          })),
          dataCollectionPoints: dataCollectionPoints.map(d => ({
            name: d.name,
            description: d.description,
            dataType: d.dataType,
            prompt: d.prompt,
            isRequired: d.isRequired,
            isActive: d.isActive,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create agent");
      }

      const agent = await response.json();
      router.push(`/agents/${agent.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create agent");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => currentStep === 0 ? router.push("/agents") : handleBack()}
          className="text-gray-400 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Agent</h1>
          <p className="text-gray-500 text-sm">Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-1.5 text-xs whitespace-nowrap",
                index === currentStep ? "text-gray-900" : index < currentStep ? "text-gray-600" : "text-gray-400"
              )}
            >
              <div className={cn(
                "p-1 rounded",
                index === currentStep ? "bg-gray-200" : index < currentStep ? "bg-gray-200" : "bg-gray-100"
              )}>
                <step.icon className="h-3 w-3" />
              </div>
              <span className="hidden lg:inline">{step.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}

      {/* Step Content */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            {(() => { const Icon = steps[currentStep].icon; return <Icon className="h-5 w-5 text-gray-900" />; })()}
            {steps[currentStep].name}
          </CardTitle>
          <CardDescription className="text-gray-500">
            {currentStep === 0 && "Name your agent and describe its purpose"}
            {currentStep === 1 && "Define the personality and behavior of your agent"}
            {currentStep === 2 && "Configure voice settings and language"}
            {currentStep === 3 && "Select a knowledge base for your agent"}
            {currentStep === 4 && "Select the LLM provider, model, and configure settings"}
            {currentStep === 5 && "Configure conversation flow and advanced settings"}
            {currentStep === 6 && "Set up conversation analysis and data collection"}
            {currentStep === 7 && "Review your agent configuration before creating"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <Label className="text-gray-700">Agent Name <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 50))}
                    placeholder="e.g., Customer Support Agent"
                    className="bg-white border-gray-300 pr-16"
                    maxLength={50}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{name.length}/50</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this agent does..."
                  className="bg-white border-gray-300 min-h-[100px]"
                />
              </div>

              {/* Text Only toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <Label className="text-gray-900 font-medium">Text Only</Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {!voiceEnabled
                      ? "Users can only interact via text chat"
                      : "Voice + text enabled — users can speak or type"}
                  </p>
                </div>
                <Switch
                  checked={!voiceEnabled}
                  onCheckedChange={(checked) => setVoiceEnabled(!checked)}
                />
              </div>
            </>
          )}

          {/* Step 1: System Prompt */}
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label className="text-gray-700">System Prompt <span className="text-red-500">*</span></Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define the personality, goals, and guardrails..."
                  className="bg-white border-gray-300 min-h-[300px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500">Type {"{{ }}"} to add dynamic variables</p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">User Prompt</Label>
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="An optional prompt sent as the first user message..."
                  className="bg-white border-gray-300 min-h-[80px]"
                />
                <p className="text-xs text-gray-500">Optional context sent as the first user message at conversation start</p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">First Message</Label>
                <Textarea
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="The greeting message when conversation starts..."
                  className="bg-white border-gray-300 min-h-[80px]"
                />
                <p className="text-xs text-gray-500">Leave empty to let the user start the conversation</p>
              </div>
            </>
          )}

          {/* Step 2: Voice & Language */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Voice Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <Label className="text-gray-900 font-medium">Enable Voice Mode</Label>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {voiceEnabled
                      ? "Users can interact via voice or text chat"
                      : "Users can only interact via text chat"}
                  </p>
                </div>
                <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
              </div>

              {voiceEnabled ? (
                <Tabs defaultValue="voice" className="w-full">
                  <TabsList className="bg-gray-50 rounded-lg p-1 h-auto gap-1 w-fit mb-4">
                    <TabsTrigger value="voice" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200">Voice Selection</TabsTrigger>
                    <TabsTrigger value="settings" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200">Voice Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="voice" className="space-y-4">
                    {/* Language Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-700">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white max-h-[300px]">
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.flag} {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                {/* Voice Cards with Preview */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Voice</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {voices.map((voice) => (
                      <div
                        key={voice.id}
                        onClick={() => setVoiceId(voice.id)}
                        className={cn(
                          "p-3 rounded-lg border-2 cursor-pointer transition-all",
                          voiceId === voice.id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-400"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              voiceId === voice.id ? "bg-gray-200" : "bg-gray-100"
                            )}>
                              <Volume2 className={cn("h-5 w-5", voiceId === voice.id ? "text-gray-900" : "text-gray-500")} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{voice.name}</p>
                              <p className="text-xs text-gray-500">{voice.accent} • {voice.gender}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              playVoicePreview(voice);
                            }}
                          >
                            {playingVoice === voice.id ? (
                              <Pause className="h-4 w-4 text-gray-900" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{voice.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                {/* Stability */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700">Stability</Label>
                    <span className="text-sm text-gray-500">{stability}%</span>
                  </div>
                  <Slider
                    value={[stability]}
                    onValueChange={(v) => setStability(v[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Lower = more emotional variation, Higher = more consistent delivery
                  </p>
                </div>

                {/* Similarity Boost */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700">Clarity + Similarity</Label>
                    <span className="text-sm text-gray-500">{similarityBoost}%</span>
                  </div>
                  <Slider
                    value={[similarityBoost]}
                    onValueChange={(v) => setSimilarityBoost(v[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Higher values boost clarity and voice consistency
                  </p>
                </div>

                {/* Style Exaggeration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700">Style Exaggeration</Label>
                    <span className="text-sm text-gray-500">{styleExaggeration}%</span>
                  </div>
                  <Slider
                    value={[styleExaggeration]}
                    onValueChange={(v) => setStyleExaggeration(v[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Amplifies the original speaker&apos;s style (may increase latency)
                  </p>
                </div>

                {/* Speaker Boost */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label className="text-gray-700">Speaker Boost</Label>
                    <p className="text-xs text-gray-500">Enhance speaker clarity and presence</p>
                  </div>
                  <Switch checked={speakerBoost} onCheckedChange={setSpeakerBoost} />
                </div>
              </TabsContent>
            </Tabs>
              ) : (
                /* Text-Only Mode */
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Text Chat Only</h3>
                  <p className="text-sm text-gray-500">
                    Voice mode is disabled. Users will only be able to interact via text chat.
                  </p>
                  <div className="mt-4 space-y-2">
                    <Label className="text-gray-700">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-white border-gray-300 max-w-xs mx-auto"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white max-h-[300px]">
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Knowledge Base */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Database className="h-4 w-4" /> Select Knowledge Base
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {knowledgeBases.length} available
                </Badge>
              </div>

              {isLoadingKBs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : knowledgeBases.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Database className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No knowledge bases available</p>
                  <p className="text-xs text-gray-400 mt-1">Knowledge bases will be synced from Directus</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {knowledgeBases.map((kb) => (
                      <button
                        key={kb.id}
                        onClick={() => setSelectedKnowledgeBase(kb.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all text-left",
                          selectedKnowledgeBase === kb.id
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900">{kb.name}</h4>
                            <Badge variant="secondary" className="text-[10px] mt-1 bg-gray-100 text-gray-600">
                              {kb.category}
                            </Badge>
                          </div>
                          {selectedKnowledgeBase === kb.id && (
                            <CheckCircle className="h-5 w-5 text-gray-900 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {kb.description || "No description"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{kb.documentCount} docs</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedKnowledgeBase(null)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all text-left",
                      selectedKnowledgeBase === null
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">No Knowledge Base</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Agent will use only the system prompt without external knowledge
                        </p>
                      </div>
                      {selectedKnowledgeBase === null && (
                        <CheckCircle className="h-5 w-5 text-gray-900" />
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: LLM Settings */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Main LLM */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Brain className="h-4 w-4" /> Primary LLM
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Provider</Label>
                    <Select value={llmProvider} onValueChange={(v) => {
                      setLlmProvider(v);
                      const provider = llmProviders.find(p => p.id === v);
                      if (provider?.models[0]) setLlmModel(provider.models[0].id);
                    }}>
                      <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        {llmProviders.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Model</Label>
                    <Select value={llmModel} onValueChange={setLlmModel}>
                      <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        {selectedProviderData?.models.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <div className="flex flex-col">
                              <span>{m.name}</span>
                              <span className="text-xs text-gray-500">{m.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700">Temperature</Label>
                    <span className="text-sm text-gray-500">{temperature}</span>
                  </div>
                  <Slider
                    value={[temperature * 100]}
                    onValueChange={(v) => setTemperature(v[0] / 100)}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Consistent (0.0)</span>
                    <span>Balanced (0.5)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Max Response Tokens</Label>
                  <Select value={maxTokens.toString()} onValueChange={(v) => setMaxTokens(parseInt(v))}>
                    <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="256">256 tokens (short)</SelectItem>
                      <SelectItem value="512">512 tokens</SelectItem>
                      <SelectItem value="1000">1000 tokens (default)</SelectItem>
                      <SelectItem value="2000">2000 tokens</SelectItem>
                      <SelectItem value="4000">4000 tokens (long)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Thinking Budget (for supported models) */}
                {selectedProviderData?.supportsThinking && (
                  <div className="space-y-2">
                    <Label className="text-gray-700">Thinking Budget</Label>
                    <Select value={thinkingBudget} onValueChange={setThinkingBudget}>
                      <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="low">Low (faster responses)</SelectItem>
                        <SelectItem value="medium">Medium (balanced)</SelectItem>
                        <SelectItem value="high">High (better reasoning)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Controls internal reasoning tokens for complex tasks
                    </p>
                  </div>
                )}
              </div>

              {/* Backup LLM */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Backup LLM
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Fallback model if primary fails</p>
                  </div>
                  <Switch checked={enableBackupLlm} onCheckedChange={setEnableBackupLlm} />
                </div>

                {enableBackupLlm && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Provider</Label>
                      <Select value={backupLlmProvider} onValueChange={(v) => {
                        setBackupLlmProvider(v);
                        const provider = llmProviders.find(p => p.id === v);
                        if (provider?.models[0]) setBackupLlmModel(provider.models[0].id);
                      }}>
                        <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                          {llmProviders.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Model</Label>
                      <Select value={backupLlmModel} onValueChange={setBackupLlmModel}>
                        <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                          {selectedBackupProviderData?.models.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Advanced / Conversation Flow */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Conversation Flow */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Conversation Flow
                </h3>

                {/* Turn Taking */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Turn Taking Mode</Label>
                  <Select value={turnTaking} onValueChange={setTurnTaking}>
                    <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="auto">Auto (recommended)</SelectItem>
                      <SelectItem value="server">Server VAD</SelectItem>
                      <SelectItem value="client">Client VAD</SelectItem>
                      <SelectItem value="manual">Manual (push-to-talk)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    How the agent determines when to speak
                  </p>
                </div>

                {/* Interruptible */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label className="text-gray-700">Allow Interruptions</Label>
                    <p className="text-xs text-gray-500">Users can interrupt the agent while speaking</p>
                  </div>
                  <Switch checked={allowInterrupt} onCheckedChange={setAllowInterrupt} />
                </div>

                {/* End on Goodbye */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label className="text-gray-700">End Call on Goodbye</Label>
                    <p className="text-xs text-gray-500">Automatically end when user says goodbye</p>
                  </div>
                  <Switch checked={endCallOnGoodbye} onCheckedChange={setEndCallOnGoodbye} />
                </div>
              </div>

              {/* Timeouts */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Timeouts
                </h3>

                {/* Silence Timeout */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700">Silence Timeout</Label>
                    <span className="text-sm text-gray-500">{silenceTimeout}s</span>
                  </div>
                  <Slider
                    value={[silenceTimeout]}
                    onValueChange={(v) => setSilenceTimeout(v[0])}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Time to wait for user response before prompting
                  </p>
                </div>

                {/* Response Timeout */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700">Response Timeout</Label>
                    <span className="text-sm text-gray-500">{responseTimeout}s</span>
                  </div>
                  <Slider
                    value={[responseTimeout]}
                    onValueChange={(v) => setResponseTimeout(v[0])}
                    min={5}
                    max={120}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Maximum time to wait for LLM response
                  </p>
                </div>

                {/* Max Duration */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Max Call Duration</Label>
                  <Select value={maxDuration.toString()} onValueChange={(v) => setMaxDuration(parseInt(v))}>
                    <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="600">10 minutes</SelectItem>
                      <SelectItem value="900">15 minutes</SelectItem>
                      <SelectItem value="1800">30 minutes</SelectItem>
                      <SelectItem value="3600">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ambient Sound */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Music className="h-4 w-4" /> Tool Call Sounds
                </h3>
                <div className="space-y-2">
                  <Label className="text-gray-700">Ambient Sound</Label>
                  <Select value={ambientSound} onValueChange={setAmbientSound}>
                    <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      {ambientSounds.map((sound) => (
                        <SelectItem key={sound.id} value={sound.id}>
                          <div className="flex flex-col">
                            <span>{sound.name}</span>
                            <span className="text-xs text-gray-500">{sound.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Audio feedback during tool execution to fill silence
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Analysis */}
          {currentStep === 6 && (
            <AnalysisSettings
              evaluationCriteria={evaluationCriteria}
              dataCollectionPoints={dataCollectionPoints}
              analysisLanguage={analysisLanguage}
              enableAnalysis={enableAnalysis}
              onEvaluationCriteriaChange={setEvaluationCriteria}
              onDataCollectionPointsChange={setDataCollectionPoints}
              onAnalysisLanguageChange={setAnalysisLanguage}
              onEnableAnalysisChange={setEnableAnalysis}
            />
          )}

          {/* Step 7: Review */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Agent Name</p>
                  <p className="font-medium text-gray-900">{name || "Unnamed"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="font-medium text-gray-900">{description || "No description"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Mode</p>
                  <p className="font-medium text-gray-900">
                    {voiceEnabled ? `Voice + Text · ${selectedVoice?.name} (${selectedVoice?.accent})` : "Text Only"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Language</p>
                  <p className="font-medium text-gray-900">{languages.find(l => l.code === language)?.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Primary LLM</p>
                  <p className="font-medium text-gray-900">{llmProvider} / {llmModel}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Backup LLM</p>
                  <p className="font-medium text-gray-900">
                    {enableBackupLlm ? `${backupLlmProvider} / ${backupLlmModel}` : "Disabled"}
                  </p>
                </div>
              </div>

              {/* Voice Settings Summary */}
              {voiceEnabled && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Voice Settings</p>
                  <div className="flex gap-4 text-sm text-gray-700">
                    <span>Stability: {stability}%</span>
                    <span>Clarity: {similarityBoost}%</span>
                    <span>Style: {styleExaggeration}%</span>
                  </div>
                </div>
              )}

              {/* Conversation Flow Summary */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Conversation Settings</p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                  <span className="px-2 py-1 bg-gray-200 rounded">Turn: {turnTaking}</span>
                  <span className="px-2 py-1 bg-gray-200 rounded">
                    {allowInterrupt ? "Interruptible" : "Non-interruptible"}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 rounded">
                    Max: {maxDuration / 60} min
                  </span>
                </div>
              </div>

              {/* System Prompt Preview */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">System Prompt Preview</p>
                <p className="text-sm text-gray-700 line-clamp-4 whitespace-pre-wrap">{systemPrompt}</p>
              </div>

              {/* Analysis Summary */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Analysis</p>
                <p className="text-sm text-gray-700">
                  {enableAnalysis ? `${evaluationCriteria.length} criteria, ${dataCollectionPoints.length} data points` : "Disabled"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0} className="text-gray-500">
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext} disabled={!canProceed()} className="bg-gray-900 hover:bg-gray-800 text-white">
            Next<ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={isCreating || !name.trim()} className="bg-gray-900 hover:bg-gray-800 text-white">
            {isCreating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <><Check className="h-4 w-4 mr-2" />Create Agent</>}
          </Button>
        )}
      </div>
    </div>
  );
}
