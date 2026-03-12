"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, Search, Check, ChevronDown, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VoiceOption {
  id: string;
  name: string;
  gender: "male" | "female";
  accent: string;
  description: string;
  style: string;
  previewText: string;
  pitch: number;
  rate: number;
  ttsLang: string;
  ttsVoice: string; // StreamElements/Amazon Polly voice name
}

export const VOICE_LIBRARY: VoiceOption[] = [
  // ── Female Voices ──────────────────────────────────────────────────────
  {
    id: "rachel",
    name: "Rachel",
    gender: "female",
    accent: "American",
    description: "Calm, professional",
    style: "Clear and composed. Great for customer support and formal agents.",
    previewText: "Hello! I'm Rachel, your professional assistant. How can I help you today?",
    pitch: 1.1,
    rate: 1.15,
    ttsLang: "en",
    ttsVoice: "Joanna",
  },
  {
    id: "sarah",
    name: "Sarah",
    gender: "female",
    accent: "Australian",
    description: "Soft, warm accent",
    style: "Gentle Australian tone. Ideal for healthcare and wellness agents.",
    previewText: "Hello, I'm Sarah. I'm here to help you in any way I can.",
    pitch: 1.2,
    rate: 1.10,
    ttsLang: "en-au",
    ttsVoice: "Nicole",
  },
  {
    id: "domi",
    name: "Domi",
    gender: "female",
    accent: "American",
    description: "Energetic, youthful",
    style: "Bright and upbeat. Best for sales and engagement-driven agents.",
    previewText: "Hey! I'm Domi! Super excited to help you out today!",
    pitch: 1.3,
    rate: 1.40,
    ttsLang: "en",
    ttsVoice: "Salli",
  },
  {
    id: "jessica",
    name: "Jessica",
    gender: "female",
    accent: "British",
    description: "Confident, direct",
    style: "Assertive and clear. Works well for coaching or advisory agents.",
    previewText: "Hi, I'm Jessica. I'm here to help you get things done. What do you need?",
    pitch: 0.95,
    rate: 1.05,
    ttsLang: "en-gb",
    ttsVoice: "Amy",
  },
  {
    id: "bella",
    name: "Bella",
    gender: "female",
    accent: "Irish",
    description: "Warm, nurturing",
    style: "Friendly and empathetic. Perfect for onboarding and support.",
    previewText: "Hi there! I'm Bella. It's so nice to meet you. How can I help?",
    pitch: 1.05,
    rate: 1.20,
    ttsLang: "en-ie",
    ttsVoice: "Emma",
  },

  // ── Male Voices ────────────────────────────────────────────────────────
  {
    id: "drew",
    name: "Drew",
    gender: "male",
    accent: "American",
    description: "Confident, friendly",
    style: "Upbeat and reliable. A natural fit for tech or e-commerce agents.",
    previewText: "Hey there! I'm Drew. I'm here to help you with anything you need.",
    pitch: 0.9,
    rate: 1.35,
    ttsLang: "en",
    ttsVoice: "Matthew",
  },
  {
    id: "clyde",
    name: "Clyde",
    gender: "male",
    accent: "American",
    description: "Deep, authoritative",
    style: "Strong and trustworthy. Ideal for legal, finance, or security agents.",
    previewText: "Good day. I'm Clyde. How may I assist you with your inquiry?",
    pitch: 0.7,
    rate: 1.15,
    ttsLang: "en",
    ttsVoice: "Joey",
  },
  {
    id: "paul",
    name: "Paul",
    gender: "male",
    accent: "Australian",
    description: "Warm, conversational",
    style: "Easygoing and relatable. Great for general-purpose agents.",
    previewText: "Hi! I'm Paul. It's great to meet you. What can I do for you?",
    pitch: 1.0,
    rate: 1.30,
    ttsLang: "en-au",
    ttsVoice: "Russell",
  },
  {
    id: "dave",
    name: "Dave",
    gender: "male",
    accent: "British",
    description: "Casual, approachable",
    style: "Relaxed British tone. Great for lifestyle and consumer brands.",
    previewText: "Hello there! I'm Dave. Lovely to meet you. How can I be of service?",
    pitch: 0.95,
    rate: 1.28,
    ttsLang: "en-gb",
    ttsVoice: "Brian",
  },
  {
    id: "adam",
    name: "Adam",
    gender: "male",
    accent: "Indian",
    description: "Deep, composed",
    style: "Steady and measured. Suitable for educational or informational agents.",
    previewText: "Hello. I'm Adam. I'm here to provide you with the information you need.",
    pitch: 0.8,
    rate: 1.22,
    ttsLang: "en-in",
    ttsVoice: "Justin",
  },
];

const ACCENT_COLORS: Record<string, string> = {
  American: "bg-gray-50 text-gray-700 border-gray-200",
  British: "bg-gray-50 text-gray-700 border-gray-200",
  Australian: "bg-gray-50 text-gray-700 border-gray-200",
  Irish: "bg-gray-50 text-gray-700 border-gray-200",
};

interface VoicePickerProps {
  value: string | null;
  onChange: (voiceId: string | null) => void;
}

export function VoicePicker({ value, onChange }: VoicePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "female" | "male">("all");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selected = value ? VOICE_LIBRARY.find((v) => v.id === value) : null;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const filtered = VOICE_LIBRARY.filter((v) => {
    const matchesGender = genderFilter === "all" || v.gender === genderFilter;
    const matchesSearch =
      search === "" ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.accent.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase());
    return matchesGender && matchesSearch;
  });

  const females = filtered.filter((v) => v.gender === "female");
  const males = filtered.filter((v) => v.gender === "male");

  function handleSelect(voiceId: string) {
    onChange(voiceId === value ? null : voiceId);
    setOpen(false);
  }

  async function handlePreview(e: React.MouseEvent, voice: VoiceOption) {
    e.stopPropagation();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (playingId === voice.id) { setPlayingId(null); return; }
    setPlayingId(voice.id);
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(voice.previewText)}&lang=${voice.ttsLang}`);
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = voice.rate;
      audioRef.current = audio;
      audio.onended = () => { setPlayingId(null); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.onerror = () => { setPlayingId(null); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.play();
    } catch { setPlayingId(null); }
  }

  function handleDialogChange(nextOpen: boolean) {
    if (!nextOpen) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPlayingId(null);
    }
    setOpen(nextOpen);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50 h-9 px-3"
        onClick={() => setOpen(true)}
      >
        {selected ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
              selected.gender === "female" ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-600"
            )}>
              {selected.gender === "female" ? "F" : "M"}
            </div>
            <span className="font-medium text-gray-800 text-xs truncate">{selected.name}</span>
            <span className="text-gray-400 text-xs truncate">{selected.accent} · {selected.description}</span>
          </div>
        ) : (
          <span className="text-gray-500 text-xs">Select a voice...</span>
        )}
        <ChevronDown className="ml-2 h-4 w-4 text-gray-400 flex-shrink-0" />
      </Button>

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0 bg-white">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
            <DialogTitle className="text-base font-semibold text-gray-900">Choose a Voice</DialogTitle>
          </DialogHeader>

          {/* Search + Gender Filter */}
          <div className="px-5 py-3 border-b border-gray-100 flex-shrink-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search voices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200 h-9 text-sm"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              {(["all", "female", "male"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-medium transition-colors",
                    genderFilter === g
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {g === "all" ? "All Voices" : g === "female" ? "Female" : "Male"}
                  <span className="ml-1 opacity-70">
                    ({g === "all" ? filtered.length : g === "female" ? females.length : males.length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice List */}
          <div className="overflow-y-auto flex-1 px-5 py-3 space-y-4">
            {(genderFilter === "all" || genderFilter === "female") && females.length > 0 && (
              <VoiceGroup
                title="Female Voices"
                voices={females}
                selected={value}
                playingId={playingId}
                onSelect={handleSelect}
                onPreview={handlePreview}
                accentColors={ACCENT_COLORS}
              />
            )}
            {(genderFilter === "all" || genderFilter === "male") && males.length > 0 && (
              <VoiceGroup
                title="Male Voices"
                voices={males}
                selected={value}
                playingId={playingId}
                onSelect={handleSelect}
                onPreview={handlePreview}
                accentColors={ACCENT_COLORS}
              />
            )}
            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm text-gray-500">
                No voices match your search.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0 flex items-center justify-between">
            {selected ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <span>Selected: <strong className="text-gray-800">{selected.name}</strong></span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">No voice selected</span>
            )}
            <div className="flex gap-2">
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-600"
                  onClick={() => { onChange(null); handleDialogChange(false); }}
                >
                  Clear
                </Button>
              )}
              <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white" onClick={() => handleDialogChange(false)}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface VoiceGroupProps {
  title: string;
  voices: VoiceOption[];
  selected: string | null;
  playingId: string | null;
  onSelect: (id: string) => void;
  onPreview: (e: React.MouseEvent, voice: VoiceOption) => void;
  accentColors: Record<string, string>;
}

function VoiceGroup({ title, voices, selected, playingId, onSelect, onPreview, accentColors }: VoiceGroupProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="grid grid-cols-1 gap-1.5">
        {voices.map((voice) => {
          const isSelected = selected === voice.id;
          const isPlaying = playingId === voice.id;
          const accentClass = accentColors[voice.accent] ?? "bg-gray-50 text-gray-700 border-gray-200";

          return (
            <button
              key={voice.id}
              onClick={() => onSelect(voice.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all",
                isSelected
                  ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900/20"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {/* Gender Avatar */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                voice.gender === "female" ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-600"
              )}>
                {voice.name[0]}
              </div>

              {/* Voice Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("text-sm font-medium", isSelected ? "text-gray-900" : "text-gray-800")}>
                    {voice.name}
                  </span>
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", accentClass)}>
                    {voice.accent}
                  </span>
                  <span className="text-xs text-gray-500">{voice.description}</span>
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{voice.style}</p>
              </div>

              {/* Preview + Selected */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  role="button"
                  aria-label={isPlaying ? "Stop preview" : "Preview voice"}
                  title={isPlaying ? "Stop preview" : "Preview voice"}
                  onClick={(e) => onPreview(e, voice)}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                    isPlaying
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
