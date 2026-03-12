"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentCard } from "@/components/agents/agent-card";
import { Plus, Search, SlidersHorizontal, Bot, Loader2, Zap, MessageSquare } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  llmProvider: string;
  llmModel: string;
  isActive: boolean;
  conversationCount: number;
  createdAt: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setAgents(agents.filter((agent) => agent.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete agent:", error);
    }
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-2">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gray-900 rounded-xl">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
            </div>
          </div>
          <p className="text-gray-600 text-base">
            Create and manage your AI voice agents for powerful automated conversations
          </p>
        </div>
        <Link href="/agents/new">
          <Button 
            size="lg"
            className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      {!isLoading && agents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Bot className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Zap className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.filter(a => a.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.reduce((sum, a) => sum + (a.conversationCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search agents by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-white border-gray-200 h-11 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <Button 
          variant="outline" 
          className="border-gray-200 text-gray-700 hover:border-gray-900 hover:bg-gray-50 h-11 px-6"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredAgents.length > 0 ? (
        /* Agent Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-gray-100 mb-4">
            <Bot className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Create your first AI voice agent to handle conversations,
            answer questions, and assist your users.
          </p>
          <Link href="/agents/new">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Agent
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
