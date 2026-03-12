"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoiceCard } from "@/components/voices/voice-card";
import { Search, Plus, Mic } from "lucide-react";
import Link from "next/link";

// Mock voices data
const mockVoices = [
  {
    id: "voice-1",
    name: "Sarah",
    description: "A warm and friendly voice, perfect for customer support and general assistance.",
    language: "en",
    gender: "female",
    accent: "American",
    category: "premade",
    tags: "conversational,friendly",
  },
  {
    id: "voice-2",
    name: "James",
    description: "Professional and authoritative, ideal for business applications and formal contexts.",
    language: "en",
    gender: "male",
    accent: "British",
    category: "premade",
    tags: "professional,news",
  },
  {
    id: "voice-3",
    name: "Emma",
    description: "Energetic and youthful, great for marketing and engaging content.",
    language: "en",
    gender: "female",
    accent: "American",
    category: "premade",
    tags: "energetic,marketing",
  },
  {
    id: "voice-4",
    name: "Michael",
    description: "Deep and reassuring, perfect for narration and storytelling.",
    language: "en",
    gender: "male",
    accent: "American",
    category: "premade",
    tags: "narrative,deep",
  },
  {
    id: "voice-5",
    name: "Sofia",
    description: "Natural Spanish voice with clear pronunciation, ideal for bilingual applications.",
    language: "es",
    gender: "female",
    accent: "Latin American",
    category: "premade",
    tags: "conversational,natural",
  },
  {
    id: "voice-6",
    name: "Hans",
    description: "Professional German voice suitable for business and technical content.",
    language: "de",
    gender: "male",
    accent: "German",
    category: "premade",
    tags: "professional,technical",
  },
  {
    id: "voice-7",
    name: "Marie",
    description: "Elegant French voice, perfect for luxury brands and sophisticated content.",
    language: "fr",
    gender: "female",
    accent: "French",
    category: "premade",
    tags: "elegant,luxury",
  },
  {
    id: "voice-8",
    name: "Alex",
    description: "Neutral and versatile voice that works well across various applications.",
    language: "en",
    gender: "neutral",
    accent: "American",
    category: "premade",
    tags: "neutral,versatile",
  },
];

export default function VoicesPage() {
  const [search, setSearch] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredVoices = mockVoices.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      v.name.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.tags.toLowerCase().includes(q);
    return matchSearch
      && (filterLanguage === "all" || v.language === filterLanguage)
      && (filterGender === "all" || v.gender === filterGender)
      && (filterCategory === "all" || v.category === filterCategory);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voice Library</h1>
          <p className="text-gray-500 mt-1">
            Browse and preview available voices for your agents
          </p>
        </div>
        <Link href="/voices/clone">
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Clone Voice
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search voices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <Select value={filterLanguage} onValueChange={setFilterLanguage}>
          <SelectTrigger className="w-[140px] bg-white border-gray-300 text-gray-900">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="text-gray-700 hover:bg-gray-100">All Languages</SelectItem>
            <SelectItem value="en" className="text-gray-700 hover:bg-gray-100">English</SelectItem>
            <SelectItem value="es" className="text-gray-700 hover:bg-gray-100">Spanish</SelectItem>
            <SelectItem value="fr" className="text-gray-700 hover:bg-gray-100">French</SelectItem>
            <SelectItem value="de" className="text-gray-700 hover:bg-gray-100">German</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterGender} onValueChange={setFilterGender}>
          <SelectTrigger className="w-[120px] bg-white border-gray-300 text-gray-900">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="text-gray-700 hover:bg-gray-100">All</SelectItem>
            <SelectItem value="male" className="text-gray-700 hover:bg-gray-100">Male</SelectItem>
            <SelectItem value="female" className="text-gray-700 hover:bg-gray-100">Female</SelectItem>
            <SelectItem value="neutral" className="text-gray-700 hover:bg-gray-100">Neutral</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[130px] bg-white border-gray-300 text-gray-900">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="text-gray-700 hover:bg-gray-100">All</SelectItem>
            <SelectItem value="premade" className="text-gray-700 hover:bg-gray-100">Premade</SelectItem>
            <SelectItem value="cloned" className="text-gray-700 hover:bg-gray-100">Cloned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Voice Grid */}
      {filteredVoices.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVoices.map((voice) => (
            <VoiceCard key={voice.id} voice={voice} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-gray-100 mb-4">
            <Mic className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No voices found</h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            Try adjusting your filters or clone a new voice.
          </p>
        </div>
      )}
    </div>
  );
}
