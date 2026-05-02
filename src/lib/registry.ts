import { LayoutDashboard, Users, Globe, Mail, MessageSquare, Workflow, Bot, BarChart3, Database, Plug, FileEdit, MessageCircle, Star, Phone, Calendar, Share2 } from 'lucide-react';
import type { LucideIcon } from '@/types/icons';

export type ModuleCategory =
  | 'crm'
  | 'marketing'
  | 'automation'
  | 'builder'
  | 'analytics'
  | 'ai'
  | 'integrations'
  | 'commerce';

export type ModuleId =
  | 'dashboard'
  | 'crm'
  | 'site_builder'
  | 'forms'
  | 'email_marketing'
  | 'sms_marketing'
  | 'workflows'
  | 'analytics'
  | 'ai_agents'
  | 'chat_widget'
  | 'invoicing'
  | 'reputation'
  | 'social_planner'
  | 'membership'
  | 'phone_system'
  | 'appointments'
  | 'integrations';

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  description: string;
  category: ModuleCategory;
  icon: LucideIcon;
  dependencies?: ModuleId[];
  isCore?: boolean; // If true, cannot be disabled
}

export const MODULES: Record<ModuleId, ModuleDefinition> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Customizable widget-based command center',
    category: 'analytics',
    icon: LayoutDashboard,
    isCore: true,
  },
  crm: {
    id: 'crm',
    name: 'Core CRM',
    description: 'Contact management, pipelines, and activity tracking',
    category: 'crm',
    icon: Users,
    isCore: true,
  },
  workflows: {
    id: 'workflows',
    name: 'Workflow Automation',
    description: 'Visual automation engine that connects everything',
    category: 'automation',
    icon: Workflow,
    dependencies: ['crm'],
    isCore: true, // Core to FlowStack vision
  },
  site_builder: {
    id: 'site_builder',
    name: 'Site & Funnel Builder',
    description: 'Drag-and-drop page builder for funnels and websites',
    category: 'builder',
    icon: Globe,
  },
  forms: {
    id: 'forms',
    name: 'Form Builder',
    description: 'Multi-step forms with conditional logic, calculations, and CRM integration',
    category: 'builder',
    icon: FileEdit,
    dependencies: ['crm'],
  },
  email_marketing: {
    id: 'email_marketing',
    name: 'Email Marketing',
    description: 'Campaigns, sequences, and templates',
    category: 'marketing',
    icon: Mail,
    dependencies: ['crm'],
  },
  sms_marketing: {
    id: 'sms_marketing',
    name: 'SMS Marketing',
    description: 'Text message campaigns and 2-way messaging',
    category: 'marketing',
    icon: MessageSquare,
    dependencies: ['crm'],
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics Suite',
    description: 'Comprehensive reporting and custom dashboards',
    category: 'analytics',
    icon: BarChart3,
  },
  ai_agents: {
    id: 'ai_agents',
    name: 'AI Agents',
    description: 'Multi-agent automation system with specialized agents for CRM, marketing, analytics, builder, and workflows',
    category: 'ai',
    icon: Bot,
    dependencies: ['workflows'],
    isCore: true, // Core to FlowStack AI vision
  },
  chat_widget: {
    id: 'chat_widget',
    name: 'Live Chat Widget',
    description: 'Real-time chat widget for websites with AI-powered responses and visitor tracking',
    category: 'crm',
    icon: MessageCircle,
    dependencies: ['crm'],
  },
  // Placeholder definitions for future modules
  invoicing: { id: 'invoicing', name: 'Invoicing', description: 'Payments & Subscriptions', category: 'crm', icon: Database },
  reputation: {
    id: 'reputation',
    name: 'Reputation Management',
    description: 'Review aggregation and response management',
    category: 'marketing',
    icon: Star,
  },
  social_planner: {
    id: 'social_planner',
    name: 'Social Planner',
    description: 'Social media scheduling, publishing, and analytics',
    category: 'marketing',
    icon: Share2,
  },
  membership: {
    id: 'membership',
    name: 'Membership Sites',
    description: 'Gated content delivery, courses, and subscription management with Stripe integration',
    category: 'commerce',
    icon: Users,
    dependencies: ['integrations'],
  },
  phone_system: {
    id: 'phone_system',
    name: 'Phone System',
    description: 'Twilio-powered calling, SMS, and voicemail',
    category: 'crm',
    icon: Phone,
  },
  appointments: { id: 'appointments', name: 'Calendar & Appointments', description: 'Calendar scheduling and appointment booking system with availability management', category: 'crm', icon: Calendar },
  integrations: {
    id: 'integrations',
    name: 'Integration Hub',
    description: 'Connect third-party services and APIs for data sync and automation',
    category: 'integrations',
    icon: Plug,
    dependencies: ['workflows'],
    isCore: true, // Core to FlowStack vision of connecting everything
  },
};

export const getModule = (id: ModuleId) => MODULES[id];
export const getAllModules = () => Object.values(MODULES);
