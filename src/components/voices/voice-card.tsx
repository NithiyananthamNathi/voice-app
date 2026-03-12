"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Heart, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Voice {
  id: string;
  name: string;
  description: string | null;
  language: string;
  gender: string | null;
  accent: string | null;
  category: string;
  tags: string | null;
}

interface VoiceCardProps {
  voice: Voice;
  onSelect?: (voice: Voice) => void;
  selected?: boolean;
}

export function VoiceCard({ voice, onSelect, selected }: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      audioRef.current?.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    try {
      const text = `Hello! I'm ${voice.name}. How can I help you today?`;
      const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}&lang=en`);
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.onerror = () => { setIsPlaying(false); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.play();
    } catch { setIsPlaying(false); }
  };

  const tags = voice.tags ? voice.tags.split(",") : [];

  return (
    <Card
      onClick={() => onSelect?.(voice)}
      className={cn(
        "bg-white border-gray-200 hover:border-gray-300 transition-all cursor-pointer group shadow-sm",
        selected && "border-gray-900 bg-gray-50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-lg",
              voice.gender === "female" ? "bg-pink-100" : "bg-cyan-100"
            )}>
              <Volume2 className={cn(
                "h-5 w-5",
                voice.gender === "female" ? "text-pink-600" : "text-cyan-600"
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{voice.name}</h3>
              <p className="text-xs text-gray-500 capitalize">
                {voice.gender} &bull; {voice.language.toUpperCase()}
                {voice.accent && ` &bull; ${voice.accent}`}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={cn(
              "h-4 w-4",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
            )} />
          </Button>
        </div>

        {voice.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {voice.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs capitalize">
            {voice.category}
          </Badge>
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="border-gray-300 text-gray-500 text-xs">
              {tag.trim()}
            </Badge>
          ))}
        </div>

        <Button
          onClick={handlePlay}
          variant="outline"
          className={cn(
            "w-full border-gray-300 text-gray-700 hover:bg-gray-100",
            isPlaying && "bg-gray-50 border-gray-900 text-gray-900"
          )}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Stop Preview
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Preview Voice
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
