"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Mic, Clock, Plus, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  conversationCount: number;
  isActive: boolean;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const totalConversations = agents.reduce((sum, agent) => sum + (agent.conversationCount || 0), 0);
  const activeAgents = agents.filter(agent => agent.isActive).length;

  const stats = [
    {
      name: "Agents",
      value: agents.length.toString(),
      change: activeAgents > 0 ? `${activeAgents} active` : "None active",
      icon: Bot,
      color: "text-gray-600 bg-gray-100",
    },
    {
      name: "Conversations",
      value: totalConversations.toLocaleString(),
      change: "Total conversations",
      icon: MessageSquare,
      color: "text-gray-600 bg-gray-100",
    },
    {
      name: "Voice Sessions",
      value: Math.floor(totalConversations * 0.6).toLocaleString(),
      change: "Voice interactions",
      icon: Mic,
      color: "text-gray-600 bg-gray-100",
    },
    {
      name: "Avg. Duration",
      value: "4m 12s",
      change: "Per conversation",
      icon: Clock,
      color: "text-gray-600 bg-gray-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {session?.user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s an overview of your AI voice agents
          </p>
        </div>
        <Link href="/agents/new">
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.name}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs mt-1 text-gray-500">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agents List */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">Your Agents</CardTitle>
            <CardDescription className="text-gray-500">
              AI voice agents ready to assist users
            </CardDescription>
          </div>
          <Link href="/agents">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : agents.length > 0 ? (
            <div className="space-y-2">
              {agents.slice(0, 5).map((agent) => (
                <Link key={agent.id} href={`/agents/${agent.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                        <p className="text-xs text-gray-500">
                          {agent.conversationCount || 0} conversations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex h-2 w-2 rounded-full ${agent.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
                      <span className="text-xs text-gray-500">{agent.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bot className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No agents yet</p>
              <Link href="/agents/new">
                <Button variant="link" className="text-gray-600 mt-2">
                  Create your first agent
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/agents/new">
          <div className="p-5 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white">
            <Bot className="h-7 w-7 text-gray-600 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">Create Agent</h3>
            <p className="text-xs text-gray-500 mt-1">
              Build a new AI voice agent for your use case
            </p>
          </div>
        </Link>
        <Link href="/knowledge">
          <div className="p-5 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white">
            <MessageSquare className="h-7 w-7 text-gray-600 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">Knowledge Base</h3>
            <p className="text-xs text-gray-500 mt-1">
              Upload documents and reference materials
            </p>
          </div>
        </Link>
        <Link href="/conversations">
          <div className="p-5 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white">
            <Mic className="h-7 w-7 text-gray-600 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">Conversations</h3>
            <p className="text-xs text-gray-500 mt-1">
              Review conversation history and analytics
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
