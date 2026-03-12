import { agents, conversations, messages, evaluationResults, collectedData } from "@/lib/store";

/**
 * Generates mock evaluation results and collected data for a conversation
 * based on the agent's configured criteria and data points.
 * Called when a conversation ends.
 */
export function generateMockAnalysis(conversationId: string, agentId: string) {
  const agent = agents.findById(agentId);
  if (!agent || !agent.enableAnalysis) return;

  const activeCriteria = agent.evaluationCriteria.filter(c => c.isActive);
  const activeDataPoints = agent.dataCollectionPoints.filter(d => d.isActive);

  // Generate evaluation results (~75% pass rate)
  if (activeCriteria.length > 0) {
    const results = activeCriteria.map(criterion => {
      const isBoolean = criterion.type === "boolean";
      const passed = Math.random() < 0.75;
      const score = isBoolean ? null : Math.floor(Math.random() * 4) + 6; // 6-9

      return {
        conversationId,
        criterionId: criterion.id,
        criterionName: criterion.name,
        type: criterion.type,
        result: isBoolean ? passed : (score !== null && score >= 7),
        score,
        analysis: generateAnalysisText(criterion.name, isBoolean ? passed : (score !== null && score >= 7)),
      };
    });

    evaluationResults.bulkCreate(results);
  }

  // Generate collected data
  if (activeDataPoints.length > 0) {
    const items = activeDataPoints.map(point => ({
      conversationId,
      dataPointId: point.id,
      dataPointName: point.name,
      dataType: point.dataType,
      value: generateMockValue(point.dataType, point.name),
    }));

    collectedData.bulkCreate(items);
  }
}

/**
 * Seeds mock conversations with evaluation results and collected data for demo purposes.
 * Called once per agent if no conversations exist yet.
 */
export function seedMockConversations(agentId: string, userId: string) {
  const agent = agents.findById(agentId);
  if (!agent) return;

  // Only seed if agent has no conversations yet
  const existing = conversations.findByAgent(agentId);
  if (existing.length > 0) return;

  const names = ["Sarah Johnson", "Mike Chen", "Emily Davis", "James Wilson", "Anna Roberts",
    "David Kim", "Lisa Thompson", "Robert Garcia", "Jennifer Lee", "Thomas Brown"];
  const sentiments = ["positive", "positive", "positive", "neutral", "neutral", "negative", "positive", "positive", "neutral", "positive"];
  const summaries = [
    "Customer asked about product pricing and features. Agent provided detailed comparison.",
    "Technical support inquiry about account access issues. Resolved after verification.",
    "New customer onboarding session. Walkthrough of main features completed.",
    "Follow-up call regarding previous complaint. Customer still unsatisfied.",
    "General inquiry about service availability in their region.",
    "Customer requested cancellation. Agent attempted retention with discount offer.",
    "Billing inquiry - customer confused about latest invoice. Clarified charges.",
    "Product demo request. Agent showcased key features and scheduled follow-up.",
    "Customer reported bug in mobile app. Escalated to engineering team.",
    "Positive feedback call. Customer praised recent improvements.",
  ];

  const sampleMessages = [
    [
      { role: "assistant", content: agent.firstMessage || "Hello! How can I help you today?" },
      { role: "user", content: "Hi, I'd like to learn about your pricing plans." },
      { role: "assistant", content: "Of course! We have three plans: Starter at $29/month, Professional at $79/month, and Enterprise with custom pricing. Each includes different features. What matters most to you?" },
      { role: "user", content: "What's included in the Professional plan?" },
      { role: "assistant", content: "The Professional plan includes unlimited conversations, advanced analytics, custom voice selection, priority support, and API access. It's our most popular choice for growing businesses." },
      { role: "user", content: "That sounds good. Can I try it first?" },
      { role: "assistant", content: "Absolutely! We offer a 14-day free trial with full access to Professional features. No credit card required. Shall I set that up for you?" },
      { role: "user", content: "Yes please, that would be great." },
      { role: "assistant", content: "I've initiated the trial setup. You should receive a confirmation email shortly. Is there anything else you'd like to know?" },
    ],
    [
      { role: "assistant", content: agent.firstMessage || "Welcome! What can I assist you with?" },
      { role: "user", content: "I can't log into my account." },
      { role: "assistant", content: "I'm sorry to hear that. Let me help you get back in. Can you tell me the email address associated with your account?" },
      { role: "user", content: "It's mike@example.com" },
      { role: "assistant", content: "I can see your account. It appears there were multiple failed login attempts, which triggered a security lock. I'll send a password reset link to your email now." },
      { role: "user", content: "Got it, thanks!" },
    ],
    [
      { role: "assistant", content: agent.firstMessage || "Hello! Ready to get started?" },
      { role: "user", content: "Yes, I just signed up and want to understand how everything works." },
      { role: "assistant", content: "Welcome aboard! Let me walk you through the key features. First, you'll want to create your first agent. Go to the Agents page and click 'Create New Agent'." },
      { role: "user", content: "Done. What's a system prompt?" },
      { role: "assistant", content: "Great question! The system prompt defines your agent's personality and behavior. Think of it as instructions that tell the AI how to respond. For example, you might write: 'You are a friendly customer support agent for a software company.'" },
      { role: "user", content: "Makes sense. And the voice settings?" },
      { role: "assistant", content: "Voice settings let you customize how the agent sounds. You can pick from different voices, adjust the speaking speed, and toggle between voice and text-only modes." },
    ],
  ];

  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 28);
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000);
    const duration = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
    const mode = Math.random() > 0.4 ? "voice" : "text";

    const conv = conversations.create({
      agentId,
      userId: null,
      mode,
      source: "widget",
      callerName: names[i],
      callerEmail: `${names[i].toLowerCase().replace(" ", ".")}@example.com`,
      callerPhone: null,
      status: "ended",
      duration,
      summary: summaries[i],
      sentiment: sentiments[i],
      resolved: Math.random() > 0.2,
      endedAt: new Date(createdAt.getTime() + duration * 1000).toISOString(),
      audioUrl: null,
      intelligence: null,
    });

    // Override createdAt for chart distribution
    const convIdx = conversations.findByAgent(agentId).findIndex(c => c.id === conv.id);
    if (convIdx !== -1) {
      conversations.update(conv.id, { createdAt: createdAt.toISOString() } as any);
    }

    // Add messages
    const msgSet = sampleMessages[i % sampleMessages.length];
    let msgTime = createdAt.getTime();
    for (const msg of msgSet) {
      msgTime += Math.floor(Math.random() * 8000) + 2000;
      messages.create({
        conversationId: conv.id,
        role: msg.role,
        content: msg.content,
        audioUrl: null,
        audioDuration: null,
        isVoiceInput: msg.role === "user" && mode === "voice",
        toolCall: null,
        ragContext: null,
      });
    }

    // Generate evaluation results for this conversation
    generateMockAnalysis(conv.id, agentId);
  }
}

function generateAnalysisText(criterionName: string, passed: boolean): string {
  const passTexts = [
    `The agent successfully addressed ${criterionName.toLowerCase()} during the conversation.`,
    `${criterionName} was handled effectively with clear communication.`,
    `The conversation demonstrated strong performance in ${criterionName.toLowerCase()}.`,
    `Criteria met - the agent showed competency in ${criterionName.toLowerCase()}.`,
  ];

  const failTexts = [
    `The agent could improve on ${criterionName.toLowerCase()} in future interactions.`,
    `${criterionName} was partially addressed but fell short of the expected standard.`,
    `There were gaps in how ${criterionName.toLowerCase()} was handled during the conversation.`,
    `The conversation did not fully meet the criteria for ${criterionName.toLowerCase()}.`,
  ];

  const texts = passed ? passTexts : failTexts;
  return texts[Math.floor(Math.random() * texts.length)];
}

function generateMockValue(dataType: string, name: string): string {
  const nameLower = name.toLowerCase();

  switch (dataType) {
    case "text": {
      if (nameLower.includes("name")) return JSON.stringify("John Smith");
      if (nameLower.includes("email")) return JSON.stringify("john.smith@example.com");
      if (nameLower.includes("phone")) return JSON.stringify("+1 (555) 123-4567");
      if (nameLower.includes("reason") || nameLower.includes("issue"))
        return JSON.stringify("Customer inquired about product features and pricing options.");
      if (nameLower.includes("feedback"))
        return JSON.stringify("The service was helpful and informative.");
      return JSON.stringify("Sample collected text value");
    }
    case "number": {
      if (nameLower.includes("rating") || nameLower.includes("score"))
        return JSON.stringify(Math.floor(Math.random() * 3) + 7); // 7-9
      if (nameLower.includes("age")) return JSON.stringify(Math.floor(Math.random() * 40) + 20);
      return JSON.stringify(Math.floor(Math.random() * 100));
    }
    case "boolean": {
      return JSON.stringify(Math.random() > 0.3);
    }
    case "array": {
      if (nameLower.includes("topic") || nameLower.includes("interest"))
        return JSON.stringify(["pricing", "features", "support"]);
      if (nameLower.includes("product"))
        return JSON.stringify(["Product A", "Product B"]);
      return JSON.stringify(["item 1", "item 2", "item 3"]);
    }
    default:
      return JSON.stringify("Unknown");
  }
}
