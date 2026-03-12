"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Code,
  Copy,
  Check,
  Rocket,
  Globe,
  Smartphone,
  Monitor,
  ExternalLink,
  Loader2,
  Bot,
} from "lucide-react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  isPublic: boolean;
  publicId: string | null;
}

export default function DeployPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  // Widget customization
  const [widgetPosition, setWidgetPosition] = useState("bottom-right");
  const [widgetTheme, setWidgetTheme] = useState("light");
  const [widgetColor, setWidgetColor] = useState("#111827");

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
        // Select first published agent by default
        const publishedAgent = data.find((a: Agent) => a.isPublic && a.publicId);
        if (publishedAgent) {
          setSelectedAgent(publishedAgent);
        }
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getWidgetCode = () => {
    if (!selectedAgent?.publicId) return "";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `<!-- Voice AI Widget -->
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${baseUrl}/consult/${selectedAgent.publicId}?embed=true&theme=${widgetTheme}&color=${encodeURIComponent(widgetColor)}';
    iframe.style.cssText = 'position:fixed;${widgetPosition === "bottom-right" ? "bottom:20px;right:20px" : "bottom:20px;left:20px"};width:400px;height:600px;border:none;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9999;';
    document.body.appendChild(iframe);
  })();
</script>`;
  };

  const getReactCode = () => {
    if (!selectedAgent?.publicId) return "";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `import { useEffect } from 'react';

export function VoiceAIWidget() {
  useEffect(() => {
    const iframe = document.createElement('iframe');
    iframe.src = '${baseUrl}/consult/${selectedAgent.publicId}?embed=true';
    iframe.style.cssText = \`
      position: fixed;
      ${widgetPosition === "bottom-right" ? "bottom: 20px; right: 20px" : "bottom: 20px; left: 20px"};
      width: 400px;
      height: 600px;
      border: none;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 9999;
    \`;
    document.body.appendChild(iframe);

    return () => {
      document.body.removeChild(iframe);
    };
  }, []);

  return null;
}`;
  };

  const getApiCode = () => {
    if (!selectedAgent?.publicId) return "";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `// Start a conversation with the agent
const response = await fetch('${baseUrl}/api/public/agents/${selectedAgent.publicId}/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'text',
    callerName: 'User Name',
    callerEmail: 'user@example.com'
  })
});

const conversation = await response.json();
console.log('Conversation started:', conversation.id);

// Send a message
const messageResponse = await fetch(\`${baseUrl}/api/conversations/\${conversation.id}/messages\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Hello, I need help'
  })
});

const message = await messageResponse.json();
console.log('Agent response:', message.content);`;
  };

  const publishedAgents = agents.filter(a => a.isPublic && a.publicId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deploy</h1>
        <p className="text-gray-500 mt-1">
          Embed your AI agents on websites and apps
        </p>
      </div>

      {publishedAgents.length === 0 ? (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <Rocket className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No published agents</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You need to publish at least one agent before you can deploy it.
              Go to your agent's detail page and click "Publish" to get started.
            </p>
            <Link href="/agents">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Bot className="h-4 w-4 mr-2" />
                Go to Agents
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Agent Selection */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Select Agent</CardTitle>
              <CardDescription className="text-gray-500">
                Choose which published agent to deploy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select
                  value={selectedAgent?.id || ""}
                  onValueChange={(value) => {
                    const agent = publishedAgents.find(a => a.id === value);
                    setSelectedAgent(agent || null);
                  }}
                >
                  <SelectTrigger className="w-[300px] bg-white border-gray-200 h-9">
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {publishedAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id} className="text-gray-700">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-emerald-600" />
                          {agent.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAgent && (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <Globe className="h-3 w-3 mr-1" />
                    Published
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedAgent && (
            <>
              {/* Widget Customization */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Widget Customization</CardTitle>
                  <CardDescription className="text-gray-500">
                    Customize how the widget appears on your website
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Position</Label>
                      <Select value={widgetPosition} onValueChange={setWidgetPosition}>
                        <SelectTrigger className="bg-white border-gray-200 h-9">
                          <SelectValue placeholder="Bottom Right" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="bottom-right" className="text-gray-700">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left" className="text-gray-700">Bottom Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Theme</Label>
                      <Select value={widgetTheme} onValueChange={setWidgetTheme}>
                        <SelectTrigger className="bg-white border-gray-200 h-9">
                          <SelectValue placeholder="Light" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="light" className="text-gray-700">Light</SelectItem>
                          <SelectItem value="dark" className="text-gray-700">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={widgetColor}
                          onChange={(e) => setWidgetColor(e.target.value)}
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={widgetColor}
                          onChange={(e) => setWidgetColor(e.target.value)}
                          className="flex-1 bg-white border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Widget Preview */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-gray-100 rounded-lg h-80 overflow-hidden">
                      <div className="absolute inset-4 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                        <p className="text-gray-400">Your website content</p>
                      </div>
                      <div
                        className={`absolute ${widgetPosition === "bottom-right" ? "right-4 bottom-4" : "left-4 bottom-4"} w-20 h-28 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center`}
                        style={{ borderColor: widgetColor }}
                      >
                        <Bot className="h-6 w-6" style={{ color: widgetColor }} />
                      </div>
                    </div>
                    {selectedAgent.publicId && (
                      <div className="mt-4">
                        <a
                          href={`/consult/${selectedAgent.publicId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:underline text-sm flex items-center gap-1"
                        >
                          Open full widget preview
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Public URL
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Share this URL directly with users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/consult/${selectedAgent.publicId}`}
                        readOnly
                        className="bg-gray-50 border-gray-300 text-gray-600"
                      />
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(
                          `${window.location.origin}/consult/${selectedAgent.publicId}`,
                          "url"
                        )}
                        className="border-gray-300"
                      >
                        {copied === "url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Code Snippets */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Integration Code
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Copy and paste these code snippets to add the widget to your website
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="html" className="w-full">
                    <TabsList className="bg-gray-50 rounded-lg p-1 h-auto gap-1 w-fit mb-4">
                      <TabsTrigger value="html" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200">
                        HTML / JavaScript
                      </TabsTrigger>
                      <TabsTrigger value="react" className="relative rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-medium transition-all duration-200">
                        React
                      </TabsTrigger>
                      <TabsTrigger value="api" className="data-[state=active]:bg-white">
                        API
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="html" className="mt-4">
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono">
                          {getWidgetCode()}
                        </pre>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(getWidgetCode(), "html")}
                        >
                          {copied === "html" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Paste this code just before the closing &lt;/body&gt; tag of your HTML.
                      </p>
                    </TabsContent>

                    <TabsContent value="react" className="mt-4">
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono">
                          {getReactCode()}
                        </pre>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(getReactCode(), "react")}
                        >
                          {copied === "react" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Import and use this component in your React application.
                      </p>
                    </TabsContent>

                    <TabsContent value="api" className="mt-4">
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono">
                          {getApiCode()}
                        </pre>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(getApiCode(), "api")}
                        >
                          {copied === "api" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Use the API to programmatically interact with your agent.
                      </p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
