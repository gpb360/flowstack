/**
 * Chat AI Features
 * AI-powered suggestions, classifications, and enhancements for the chat system
 */

import type { ChatMessage, ConversationClassification, AISuggestedResponse } from '../types';

// =====================================================
// AI-Powered Response Suggestions
// =====================================================

export async function generateSuggestedResponse(
  conversationHistory: ChatMessage[],
  context: string = ''
): Promise<AISuggestedResponse> {
  try {
    // Build context from conversation history
    const recentMessages = conversationHistory.slice(-5).map((m) => ({
      role: m.sender_type === 'visitor' ? 'user' : 'assistant',
      content: m.message,
    }));

    // Call AI service (placeholder - integrate with actual AI service)
    const response = await fetch('/api/ai/chat-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: recentMessages,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate suggestion');
    }

    const data = await response.json();
    return {
      suggestion: data.suggestion || "I understand. Let me help you with that.",
      confidence: data.confidence || 0.8,
      category: data.category || 'general',
    };
  } catch (error) {
    console.error('Error generating suggested response:', error);
    return {
      suggestion: 'Thank you for reaching out. An agent will be with you shortly.',
      confidence: 0.5,
      category: 'fallback',
    };
  }
}

export async function generateMultipleSuggestions(
  conversationHistory: ChatMessage[],
  context: string = '',
  count: number = 3
): Promise<AISuggestedResponse[]> {
  const suggestions: AISuggestedResponse[] = [];

  // Predefined common responses by category
  const commonResponses = {
    greeting: [
      'Hello! How can I help you today?',
      'Hi there! Welcome to our chat. What can I assist you with?',
      'Hey! Thanks for reaching out. How may I help you?',
    ],
    pricing: [
      'I can help you with pricing information. What product or service are you interested in?',
      'Our pricing depends on your specific needs. Let me ask you a few questions to provide an accurate quote.',
      'I\'d be happy to discuss our pricing plans. Which features are most important to you?',
    ],
    support: [
      'I\'m sorry to hear you\'re experiencing an issue. Let me help you resolve this.',
      'Thank you for bringing this to our attention. Can you provide more details about the problem?',
      'I understand how frustrating that can be. Let\'s get this fixed for you right away.',
    ],
    general: [
      'Thank you for your message. How can I assist you further?',
      'I\'m here to help. Could you please provide more details?',
      'Let me look into that for you. One moment please.',
    ],
  };

  // Determine category from conversation
  const category = categorizeConversation(conversationHistory);
  const categoryResponses = commonResponses[category as keyof typeof commonResponses] || commonResponses.general;

  for (let i = 0; i < Math.min(count, categoryResponses.length); i++) {
    suggestions.push({
      suggestion: categoryResponses[i],
      confidence: 0.7 - i * 0.1,
      category,
    });
  }

  return suggestions;
}

// =====================================================
// Conversation Classification
// =====================================================

export async function classifyConversation(
  messages: ChatMessage[]
): Promise<ConversationClassification> {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    return {
      category: 'general',
      priority: 1,
      tags: [],
      sentiment: 'neutral',
    };
  }

  const text = lastMessage.message.toLowerCase();

  // Simple keyword-based classification
  let category = 'general';
  let priority = 1;
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  const tags: string[] = [];

  // Category detection
  if (text.match(/\b(price|cost|pricing|quote|how much|expensive|cheap|affordable)\b/)) {
    category = 'sales';
    priority = 2;
    tags.push('pricing-inquiry');
  } else if (
    text.match(/\b(help|support|issue|problem|broken|error|not working|fix|resolve)\b/)
  ) {
    category = 'support';
    priority = 3;
    tags.push('support-ticket');
  } else if (
    text.match(
      /\b(buy|purchase|order|checkout|payment|credit card|refund|return|cancel)\b/
    )
  ) {
    category = 'billing';
    priority = 2;
    tags.push('billing');
  } else if (text.match(/\b(demo|trial|sign up|create account|register|get started)\b/)) {
    category = 'onboarding';
    priority = 1;
    tags.push('new-user');
  } else if (
    text.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)
  ) {
    category = 'greeting';
    priority = 1;
    tags.push('first-contact');
  }

  // Sentiment detection
  const positiveWords = [
    'thank',
    'great',
    'awesome',
    'love',
    'happy',
    'good',
    'excellent',
    'perfect',
    'amazing',
  ];
  const negativeWords = [
    'bad',
    'terrible',
    'hate',
    'angry',
    'frustrated',
    'disappointed',
    'worst',
    'awful',
  ];

  const positiveCount = positiveWords.filter((word) => text.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => text.includes(word)).length;

  if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    priority = Math.min(priority + 1, 5); // Increase priority for negative sentiment
  }

  // Urgency detection
  if (text.match(/\b(urgent|asap|immediately|emergency|critical|as soon as possible)\b/)) {
    priority = 5;
    tags.push('urgent');
  }

  return {
    category,
    priority,
    tags,
    sentiment,
  };
}

function categorizeConversation(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) return 'general';

  const text = lastMessage.message.toLowerCase();

  if (text.match(/\b(hi|hello|hey|greetings)\b/)) return 'greeting';
  if (text.match(/\b(price|cost|pricing|how much)\b/)) return 'pricing';
  if (text.match(/\b(help|issue|problem|broken)\b/)) return 'support';
  if (text.match(/\b(buy|purchase|order)\b/)) return 'sales';

  return 'general';
}

// =====================================================
// Smart Routing
// =====================================================

export interface AgentSkill {
  agentId: string;
  skills: string[];
  currentChats: number;
  maxChats: number;
}

export function smartAssignAgent(
  classification: ConversationClassification,
  availableAgents: AgentSkill[]
): string | null {
  if (availableAgents.length === 0) return null;

  // Filter agents by skills matching the category
  const skilledAgents = availableAgents.filter(
    (agent) => agent.skills.includes(classification.category) || agent.skills.includes('general')
  );

  if (skilledAgents.length === 0) {
    // Fall back to any available agent
    return leastBusyAgent(availableAgents);
  }

  // Among skilled agents, pick the least busy one
  return leastBusyAgent(skilledAgents);
}

function leastBusyAgent(agents: AgentSkill[]): string | null {
  const sorted = [...agents].sort((a, b) => {
    const aLoad = a.currentChats / a.maxChats;
    const bLoad = b.currentChats / b.maxChats;
    return aLoad - bLoad;
  });

  const agent = sorted.find((a) => a.currentChats < a.maxChats);
  return agent?.agentId || null;
}

// =====================================================
// Chat Summarization
// =====================================================

export async function summarizeConversation(
  messages: ChatMessage[],
  maxLength: number = 200
): Promise<string> {
  const keyPoints: string[] = [];

  // Extract visitor messages
  const visitorMessages = messages.filter((m) => m.sender_type === 'visitor');

  // Get first and last messages for context
  if (visitorMessages.length > 0) {
    const firstMessage = visitorMessages[0].message;
    const lastMessage = visitorMessages[visitorMessages.length - 1].message;

    keyPoints.push(`Started: ${firstMessage.substring(0, 50)}...`);
    if (visitorMessages.length > 1) {
      keyPoints.push(`Latest: ${lastMessage.substring(0, 50)}...`);
    }
  }

  // Count messages
  const messageCount = messages.length;
  keyPoints.push(`${messageCount} messages exchanged`);

  // Detect topic
  const classification = await classifyConversation(messages);
  keyPoints.push(`Topic: ${classification.category}`);

  let summary = keyPoints.join('. ');

  // Truncate if needed
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...';
  }

  return summary;
}

// =====================================================
// Sentiment Analysis Over Time
// =====================================================

export interface SentimentDataPoint {
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
}

export function analyzeSentimentTrend(
  messages: ChatMessage[]
): {
  trend: 'improving' | 'declining' | 'stable';
  overall: 'positive' | 'neutral' | 'negative';
  dataPoints: SentimentDataPoint[];
} {
  const dataPoints: SentimentDataPoint[] = [];

  for (const message of messages.filter((m) => m.sender_type === 'visitor')) {
    const sentiment = analyzeMessageSentiment(message.message);
    dataPoints.push({
      timestamp: message.sent_at,
      sentiment,
      score: sentimentToScore(sentiment),
    });
  }

  if (dataPoints.length === 0) {
    return {
      trend: 'stable',
      overall: 'neutral',
      dataPoints: [],
    };
  }

  // Calculate trend
  const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
  const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

  const firstAvg =
    firstHalf.reduce((sum, dp) => sum + dp.score, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, dp) => sum + dp.score, 0) / secondHalf.length;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (secondAvg - firstAvg > 0.2) trend = 'improving';
  else if (firstAvg - secondAvg > 0.2) trend = 'declining';

  // Calculate overall
  const avgScore = dataPoints.reduce((sum, dp) => sum + dp.score, 0) / dataPoints.length;
  let overall: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (avgScore > 0.2) overall = 'positive';
  else if (avgScore < -0.2) overall = 'negative';

  return {
    trend,
    overall,
    dataPoints,
  };
}

function analyzeMessageSentiment(message: string): 'positive' | 'neutral' | 'negative' {
  const text = message.toLowerCase();

  const positiveWords = [
    'thank',
    'great',
    'awesome',
    'love',
    'happy',
    'good',
    'excellent',
    'perfect',
    'amazing',
    'helpful',
  ];
  const negativeWords = [
    'bad',
    'terrible',
    'hate',
    'angry',
    'frustrated',
    'disappointed',
    'worst',
    'awful',
    'useless',
    'stupid',
  ];

  const positiveCount = positiveWords.filter((word) => text.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => text.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function sentimentToScore(sentiment: 'positive' | 'neutral' | 'negative'): number {
  switch (sentiment) {
    case 'positive':
      return 1;
    case 'negative':
      return -1;
    default:
      return 0;
  }
}

// =====================================================
// Auto-Response Generation
// =====================================================

export async function generateAutoResponse(
  visitorMessage: string,
  settings: {
    enabled: boolean;
    delay: number;
    message?: string;
  }
): Promise<string | null> {
  if (!settings.enabled) return null;

  // If custom auto-response is set, use it
  if (settings.message) {
    return settings.message;
  }

  // Otherwise, generate contextual response
  const classification = await classifyConversation([
    { message: visitorMessage } as ChatMessage,
  ]);

  const autoResponses: Record<string, string[]> = {
    greeting: [
      'Thanks for reaching out! An agent will be with you shortly.',
      'Hello! Welcome to our chat. Someone will be with you in just a moment.',
    ],
    sales: [
      'Thanks for your interest! A sales representative will join the chat shortly.',
      'We\'d love to help you with your inquiry. An agent will be right with you.',
    ],
    support: [
      'Thank you for contacting support. An agent will assist you shortly.',
      'We\'re sorry to hear you\'re having trouble. Help is on the way!',
    ],
    general: [
      'Thank you for your message. An agent will be with you shortly.',
      'We received your message and will be right with you.',
    ],
  };

  const responses =
    autoResponses[classification.category] || autoResponses.general;
  return responses[Math.floor(Math.random() * responses.length)];
}

// =====================================================
// Quality Scoring
// =====================================================

export interface ConversationQuality {
  score: number; // 0-100
  factors: {
    responseTime: number;
    resolutionTime: number;
    visitorSatisfaction: number;
    agentParticipation: number;
  };
  suggestions: string[];
}

export function scoreConversationQuality(
  messages: ChatMessage[],
  metrics: {
    avgResponseTime?: number; // in seconds
    resolutionTime?: number; // in seconds
    rating?: number; // 1-5
  }
): ConversationQuality {
  const factors = {
    responseTime: 0,
    resolutionTime: 0,
    visitorSatisfaction: 0,
    agentParticipation: 0,
  };
  const suggestions: string[] = [];

  // Response time score (lower is better, under 60s is ideal)
  if (metrics.avgResponseTime) {
    if (metrics.avgResponseTime <= 60) factors.responseTime = 100;
    else if (metrics.avgResponseTime <= 120) factors.responseTime = 80;
    else if (metrics.avgResponseTime <= 300) factors.responseTime = 60;
    else factors.responseTime = 40;

    if (metrics.avgResponseTime > 300) {
      suggestions.push('Response times are high. Consider adding more agents or using auto-responses.');
    }
  }

  // Resolution time score (under 15 minutes is ideal)
  if (metrics.resolutionTime) {
    const minutes = metrics.resolutionTime / 60;
    if (minutes <= 15) factors.resolutionTime = 100;
    else if (minutes <= 30) factors.resolutionTime = 80;
    else if (minutes <= 60) factors.resolutionTime = 60;
    else factors.resolutionTime = 40;

    if (minutes > 60) {
      suggestions.push('Conversations are taking too long to resolve. Consider improving agent training or resources.');
    }
  }

  // Visitor satisfaction
  if (metrics.rating) {
    factors.visitorSatisfaction = (metrics.rating / 5) * 100;
    if (metrics.rating < 3) {
      suggestions.push('Low visitor satisfaction detected. Review conversation quality and agent responses.');
    }
  }

  // Agent participation (messages sent vs total)
  const agentMessages = messages.filter((m) => m.sender_type === 'agent').length;
  const totalMessages = messages.length;
  if (totalMessages > 0) {
    const participationRatio = agentMessages / totalMessages;
    factors.agentParticipation = Math.min(participationRatio * 100 * 2, 100); // Expect at least 50% agent messages

    if (participationRatio < 0.3) {
      suggestions.push('Low agent participation. Ensure agents are actively engaging with visitors.');
    }
  }

  // Calculate overall score
  const score =
    (factors.responseTime * 0.3 +
      factors.resolutionTime * 0.25 +
      factors.visitorSatisfaction * 0.3 +
      factors.agentParticipation * 0.15);

  return {
    score: Math.round(score),
    factors,
    suggestions,
  };
}
