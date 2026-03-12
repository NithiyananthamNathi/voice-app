"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Copy, Eye, EyeOff, Trash2, Key, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock API keys
const mockApiKeys = [
  {
    id: "key-1",
    name: "Production API Key",
    key: "sk-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    lastUsed: new Date("2024-02-25"),
    requests: 15420,
    active: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "key-2",
    name: "Development Key",
    key: "sk-dev-yyyyyyyyyyyyyyyyyyyyyyyyyyyy",
    lastUsed: new Date("2024-02-20"),
    requests: 342,
    active: true,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "key-3",
    name: "Testing Key",
    key: "sk-test-zzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    lastUsed: null,
    requests: 0,
    active: false,
    createdAt: new Date("2024-02-10"),
  },
];

function ApiKeyCard({ apiKey }: { apiKey: typeof mockApiKeys[0] }) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const maskedKey = apiKey.key.slice(0, 7) + "•".repeat(24) + apiKey.key.slice(-4);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
          <Badge
            className={cn(
              apiKey.active
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-500"
            )}
          >
            {apiKey.active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <code className="px-2 py-1 rounded bg-white border border-gray-200 text-sm text-gray-700 font-mono">
            {isVisible ? apiKey.key : maskedKey}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(!isVisible)}
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{apiKey.requests.toLocaleString()} requests</span>
          <span>
            {apiKey.lastUsed
              ? `Last used ${apiKey.lastUsed.toLocaleDateString()}`
              : "Never used"}
          </span>
          <span>Created {apiKey.createdAt.toLocaleDateString()}</span>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Delete API Key</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Are you sure you want to delete &quot;{apiKey.name}&quot;? This action cannot be undone
              and any applications using this key will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-gray-700 hover:bg-gray-100 border-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ApiKeysPage() {
  const [newKeyName, setNewKeyName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-500 mt-1">
            Manage your API keys for programmatic access
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Generate Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Generate New API Key</DialogTitle>
              <DialogDescription className="text-gray-500">
                Create a new API key for accessing your agents programmatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName" className="text-gray-700">Key Name</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsDialogOpen(false)}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Key className="h-5 w-5 text-gray-600" />
            API Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-500">
            Use your API keys to integrate AI voice agents into your applications.
          </p>
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <p className="text-sm text-gray-400 mb-2">Example Request</p>
            <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
{`curl -X POST https://api.voiceai.com/v1/conversation \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"agent_id": "agent_123", "message": "Hello"}'`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Your API Keys</CardTitle>
          <CardDescription className="text-gray-500">
            {mockApiKeys.length} keys generated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockApiKeys.map((apiKey) => (
            <ApiKeyCard key={apiKey.id} apiKey={apiKey} />
          ))}
        </CardContent>
      </Card>

      {/* Usage Limits */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Rate Limits</CardTitle>
          <CardDescription className="text-gray-500">
            Current plan usage limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500">Requests per minute</p>
              <p className="text-2xl font-bold text-gray-900">60</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500">Requests per day</p>
              <p className="text-2xl font-bold text-gray-900">10,000</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500">Concurrent connections</p>
              <p className="text-2xl font-bold text-gray-900">100</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
