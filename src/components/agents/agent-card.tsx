"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, MoreVertical, Play, Settings, Trash2, Copy, ExternalLink, Zap } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  llmProvider: string;
  llmModel: string;
  isActive: boolean;
  conversationCount?: number;
  createdAt: Date | string;
}

interface AgentCardProps {
  agent: Agent;
  onDelete?: (id: string) => void;
}

function getTimeAgo(date: Date | string): string {
  const createdDate = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const router = useRouter();
  const initials = agent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or dropdown
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menu"]')) {
      return;
    }
    router.push(`/agents/${agent.id}`);
  };

  const timeAgo = getTimeAgo(agent.createdAt);

  return (
    <Card
      className="relative bg-gray-50 border-0 hover:bg-gray-100 transition-all duration-200 group cursor-pointer overflow-hidden shadow-none"
      onClick={handleCardClick}
    >
      
      {/* Header Section */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 border border-gray-200 group-hover:border-gray-300 transition-colors flex-shrink-0">
              <AvatarImage src={agent.avatar || ""} alt={agent.name} />
              <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-700 text-white font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 group-hover:text-gray-700 transition-colors truncate mb-1">
                {agent.name}
              </h3>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Badge
                  variant={agent.isActive ? "default" : "secondary"}
                  className={`${
                    agent.isActive 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  } border text-[10px] font-medium px-1.5 py-0.5`}
                >
                  <div className={`w-1 h-1 rounded-full mr-1 ${agent.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {agent.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-[10px] text-gray-400" suppressHydrationWarning>{timeAgo}</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                {agent.description || "AI voice agent"}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-900 hover:bg-gray-100 -mt-0.5 -mr-1 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg w-44">
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); router.push(`/agents/${agent.id}`); }}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer text-sm"
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); router.push(`/agents/${agent.id}/chat`); }}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer text-sm"
              >
                <Play className="mr-2 h-3.5 w-3.5" />
                Test Agent
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => e.stopPropagation()}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer text-sm"
              >
                <Copy className="mr-2 h-3.5 w-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete?.(agent.id); }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer text-sm"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Model Info & Stats Row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-gray-600 min-w-0 flex-1">
            <Zap className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-700 truncate">{agent.llmProvider}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 truncate">{agent.llmModel}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
            <MessageSquare className="h-3 w-3" />
            <span className="font-medium text-gray-700">{agent.conversationCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-200/60 flex gap-2">
        <Button
          size="sm"
          className="flex-1 h-8 bg-gray-900 hover:bg-gray-800 text-white text-xs"
          onClick={(e) => { e.stopPropagation(); router.push(`/agents/${agent.id}/chat`); }}
        >
          <Play className="h-3 w-3 mr-1" />
          Test
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-3 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs"
          onClick={(e) => { e.stopPropagation(); router.push(`/agents/${agent.id}`); }}
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>

    </Card>
  );
}
