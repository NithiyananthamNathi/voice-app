"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Database, Loader2, Brain, CheckCircle, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  category: string;
  documentCount: number;
  lastSyncedAt: string;
}

interface KnowledgeBaseTabProps {
  agentId: string;
  currentKnowledgeBaseId: string | null;
  onKnowledgeBaseChange: (kbId: string | null) => void;
}

export function KnowledgeBaseTab({ agentId, currentKnowledgeBaseId, onKnowledgeBaseChange }: KnowledgeBaseTabProps) {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [currentKB, setCurrentKB] = useState<KnowledgeBase | null>(null);
  const [isLoadingKBs, setIsLoadingKBs] = useState(false);
  const [isChangingKB, setIsChangingKB] = useState(false);
  const [selectedKBId, setSelectedKBId] = useState<string | null>(currentKnowledgeBaseId);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch knowledge bases
  useEffect(() => {
    const fetchKnowledgeBases = async () => {
      setIsLoadingKBs(true);
      try {
        const response = await fetch("/api/knowledge");
        if (response.ok) {
          const data = await response.json();
          setKnowledgeBases(data.knowledgeBases || []);
          
          // Find current KB
          if (currentKnowledgeBaseId) {
            const kb = data.knowledgeBases.find((k: KnowledgeBase) => k.id === currentKnowledgeBaseId);
            setCurrentKB(kb || null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch knowledge bases:", error);
      } finally {
        setIsLoadingKBs(false);
      }
    };

    fetchKnowledgeBases();
  }, [currentKnowledgeBaseId]);

  const handleSaveKBChange = async () => {
    setIsChangingKB(true);
    try {
      // Update agent with new KB
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knowledgeBaseId: selectedKBId }),
      });

      if (response.ok) {
        onKnowledgeBaseChange(selectedKBId);
        const newKB = knowledgeBases.find((k) => k.id === selectedKBId) || null;
        setCurrentKB(newKB);
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to update knowledge base:", error);
    } finally {
      setIsChangingKB(false);
    }
  };

  if (isLoadingKBs) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Knowledge Base */}
      {currentKB ? (
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-gray-900">{currentKB.name}</CardTitle>
                </div>
                <CardDescription>{currentKB.description}</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Change KB
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Change Knowledge Base</DialogTitle>
                    <DialogDescription>
                      Select a different knowledge base from Directus or remove the current one
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 mt-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {knowledgeBases.map((kb) => (
                        <button
                          key={kb.id}
                          onClick={() => setSelectedKBId(kb.id)}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all text-left",
                            selectedKBId === kb.id
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
                            {selectedKBId === kb.id && (
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
                      onClick={() => setSelectedKBId(null)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all text-left",
                        selectedKBId === null
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
                        {selectedKBId === null && (
                          <CheckCircle className="h-5 w-5 text-gray-900" />
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => {
                      setSelectedKBId(currentKnowledgeBaseId);
                      setDialogOpen(false);
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveKBChange} disabled={isChangingKB}>
                      {isChangingKB ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="font-medium text-gray-900">{currentKB.category}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Documents</p>
                <p className="font-medium text-gray-900">{currentKB.documentCount}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Last Synced</p>
                <p className="font-medium text-gray-900 text-xs" suppressHydrationWarning>
                  {new Date(currentKB.lastSyncedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <ExternalLink className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-blue-700">
                This knowledge base is synced from Directus. Manage documents in your Directus instance.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">No Knowledge Base Selected</CardTitle>
            <CardDescription>Connect a knowledge base from Directus to enhance your agent's responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-4">This agent doesn't have a knowledge base connected</p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Database className="h-4 w-4 mr-2" />
                    Select Knowledge Base
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Knowledge Base</DialogTitle>
                    <DialogDescription>
                      Choose a knowledge base from Directus to connect with this agent
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 mt-4">
                    {knowledgeBases.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <Database className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500">No knowledge bases available</p>
                        <p className="text-xs text-gray-400 mt-1">Knowledge bases will be synced from Directus</p>
                      </div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {knowledgeBases.map((kb) => (
                          <button
                            key={kb.id}
                            onClick={() => setSelectedKBId(kb.id)}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-all text-left",
                              selectedKBId === kb.id
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
                              {selectedKBId === kb.id && (
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
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => {
                      setSelectedKBId(null);
                      setDialogOpen(false);
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveKBChange} disabled={isChangingKB || !selectedKBId}>
                      {isChangingKB ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Connecting...
                        </>
                      ) : (
                        "Connect Knowledge Base"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-200 rounded-lg">
              <Brain className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">How Knowledge Base Works</h4>
              <p className="text-xs text-gray-600 mt-1">
                Knowledge bases are synced from your Directus CMS. When users ask questions, your agent will search through 
                the connected knowledge base to find relevant information and provide accurate, contextual responses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
