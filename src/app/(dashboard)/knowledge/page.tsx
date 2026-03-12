"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Link as LinkIcon,
  Search,
  Trash2,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  File,
  Globe,
  BookOpen,
  FileSearch,
  Database as DatabaseIcon,
  Layers,
  Bot,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  category: string;
  documentCount: number;
  charCount: number;
  source: string;
  status: string;
  lastSyncedAt: string | null;
  createdAt: string;
  assignedAgents?: { id: string; name: string }[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  charCount: number;
  status: string;
  createdAt: Date;
  agentCount: number;
}

function KnowledgeBaseCard({
  kb,
  onDelete,
}: {
  kb: KnowledgeBase;
  onDelete: (id: string) => void;
}) {
  const statusConfig = {
    ready: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
    syncing: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
    error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
  };

  const status = statusConfig[kb.status as keyof typeof statusConfig] || statusConfig.ready;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center justify-between p-5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4 flex-1">
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
          <DatabaseIcon className="h-6 w-6 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 mb-0.5">{kb.name}</h4>
              <p className="text-sm text-gray-500 mb-2 line-clamp-1">{kb.description}</p>
            </div>
            <Badge className="shrink-0 bg-gray-100 text-gray-700 border-0 text-xs">
              {kb.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-500">
              {kb.documentCount} {kb.documentCount === 1 ? "document" : "documents"}
            </span>
            <span className="text-xs text-gray-500">
              {(kb.charCount / 1000).toFixed(0)}k characters
            </span>
            {kb.source === "directus" && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Directus
              </span>
            )}
          </div>

          {kb.assignedAgents && kb.assignedAgents.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Bot className="h-3.5 w-3.5 text-gray-400" />
              <div className="flex flex-wrap gap-1.5">
                {kb.assignedAgents.map((agent) => (
                  <Badge
                    key={agent.id}
                    variant="secondary"
                    className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5"
                  >
                    {agent.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <Badge className={cn(status.bg, status.color, "border-0")}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {kb.status.charAt(0).toUpperCase() + kb.status.slice(1)}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-gray-200">
            <DropdownMenuItem className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer">
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer">
              Sync Now
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(kb.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const fetchKnowledgeBases = async () => {
    try {
      const response = await fetch("/api/knowledge");
      if (response.ok) {
        const data = await response.json();
        setKnowledgeBases(data.knowledgeBases || []);
      }
    } catch (error) {
      console.error("Failed to fetch knowledge bases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocs = acceptedFiles.map((file, index) => ({
      id: `doc-${Date.now()}-${index}`,
      name: file.name,
      type: file.name.split(".").pop() || "file",
      charCount: 0,
      status: "processing" as const,
      createdAt: new Date(),
      agentCount: 0,
    }));

    setDocuments((prev) => [...newDocs, ...prev]);

    // Simulate processing completion
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) =>
          newDocs.find((d) => d.id === doc.id)
            ? { ...doc, status: "ready", charCount: Math.floor(Math.random() * 50000) + 5000 }
            : doc
        )
      );
    }, 2000);
  }, []);

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;

    const newDoc: Document = {
      id: `url-${Date.now()}`,
      name: urlInput,
      type: "url",
      charCount: 0,
      status: "processing",
      createdAt: new Date(),
      agentCount: 0,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setUrlInput("");

    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === newDoc.id
            ? { ...doc, status: "ready", charCount: Math.floor(Math.random() * 30000) + 5000 }
            : doc
        )
      );
    }, 3000);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this knowledge base?")) return;
    setKnowledgeBases((prev) => prev.filter((kb) => kb.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/markdown": [".md"],
    },
  });

  const totalCharacters = knowledgeBases.reduce((sum, kb) => sum + kb.charCount, 0);
  const maxCharacters = 1000000;
  const usagePercentage = Math.min((totalCharacters / maxCharacters) * 100, 100);

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-500 mt-1">
          Upload documents to enhance your AI agents with domain-specific knowledge
        </p>
      </div>

      {/* Suggested Content Types */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <Layers className="h-6 w-6 text-gray-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Recommended Documents</h3>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>Guidelines & Policies</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DatabaseIcon className="h-4 w-4" />
                  <span>Reference Data</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileSearch className="h-4 w-4" />
                  <span>Standard Procedures</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>FAQs & Help Articles</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage - only show if knowledge bases exist */}
      {knowledgeBases.length > 0 && (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 text-base">Storage Usage</CardTitle>
              <span className="text-sm text-gray-500">
                {(totalCharacters / 1000).toFixed(1)}k / {(maxCharacters / 1000).toFixed(0)}k characters
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-900 h-2 rounded-full transition-all"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {(100 - usagePercentage).toFixed(1)}% storage remaining
            </p>
          </CardContent>
        </Card>
      )}

      {/* Knowledge Bases List */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Knowledge Bases</CardTitle>
              <CardDescription className="text-gray-500">
                {knowledgeBases.length} knowledge base{knowledgeBases.length !== 1 ? "s" : ""} synced from Directus
              </CardDescription>
            </div>
            {knowledgeBases.length > 0 && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search knowledge bases..."
                  className="pl-10 bg-white border-gray-300 text-gray-900"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {knowledgeBases.length === 0 ? (
            <div className="text-center py-12">
              <DatabaseIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge bases yet</h3>
              <p className="text-gray-500 mb-4">
                Knowledge bases from Directus will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {knowledgeBases.map((kb) => (
                <KnowledgeBaseCard key={kb.id} kb={kb} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
