import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wrench, Globe, Calendar, CreditCard, MessageSquare, Zap } from "lucide-react";

const integrations = [
  {
    id: "webhook",
    name: "Custom Webhook",
    description: "Connect your agent to any external API",
    icon: Globe,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Schedule appointments and check availability",
    icon: Calendar,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Process payments and check order status",
    icon: CreditCard,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send notifications and messages to Slack",
    icon: MessageSquare,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect to 5,000+ apps through Zapier",
    icon: Zap,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tools & Integrations</h1>
          <p className="text-gray-500 mt-1">
            Connect your agents to external services and APIs
          </p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Tool
        </Button>
      </div>

      {/* Active Tools */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Active Tools</CardTitle>
          <CardDescription className="text-gray-500">
            Tools currently configured for your agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-gray-100 inline-block mb-4">
              <Wrench className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tools configured</h3>
            <p className="text-gray-500 mb-4 max-w-sm mx-auto">
              Add tools to enable your agents to perform actions like scheduling, payments, and more.
            </p>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Tool
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Available Integrations</CardTitle>
          <CardDescription className="text-gray-500">
            Pre-built integrations you can add to your agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${integration.bgColor}`}>
                    <integration.icon className={`h-6 w-6 ${integration.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                      {integration.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-4 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                >
                  Configure
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
