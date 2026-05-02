import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { FeatureProvider } from './context/FeatureContext';
import { ToastProvider } from './components/ui/toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FeatureGuard } from './components/FeatureGuard';
import { RoleGuard } from './components/RoleGuard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { SettingsPage } from './pages/SettingsPage';

// Onboarding & Auth Pages
const OnboardingWizard = React.lazy(() => import('./pages/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const AcceptInvitationPage = React.lazy(() => import('./pages/AcceptInvitationPage').then(m => ({ default: m.AcceptInvitationPage })));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

// Marketing/Legal Pages
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const CookiePolicyPage = React.lazy(() => import('./pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })));
const GdprPage = React.lazy(() => import('./pages/GdprPage').then(m => ({ default: m.GdprPage })));
const SecurityPage = React.lazy(() => import('./pages/SecurityPage').then(m => ({ default: m.SecurityPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const AuditIntakePage = React.lazy(() => import('./pages/AuditIntakePage').then(m => ({ default: m.AuditIntakePage })));
const PublicResourcePage = React.lazy(() => import('./pages/PublicResourcePage').then(m => ({ default: m.PublicResourcePage })));
const AuditListPage = React.lazy(() => import('./features/audit/AuditListPage').then(m => ({ default: m.AuditListPage })));
const AuditDetailPage = React.lazy(() => import('./features/audit/AuditDetailPage').then(m => ({ default: m.AuditDetailPage })));
const AuditOpsPage = React.lazy(() => import('./features/audit/AuditOpsPage').then(m => ({ default: m.AuditOpsPage })));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

// Lazy Loaded Components
// Dashboard
const DashboardPage = React.lazy(() => import('./features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));

// CRM
const CrmLayout = React.lazy(() => import('./features/crm/CrmLayout').then(m => ({ default: m.CrmLayout })));
const ContactList = React.lazy(() => import('./features/crm/ContactList').then(m => ({ default: m.ContactList })));
const CompanyList = React.lazy(() => import('./features/crm/CompanyList').then(m => ({ default: m.CompanyList })));
const ContactDetail = React.lazy(() => import('./features/crm/contacts/ContactDetail').then(m => ({ default: m.ContactDetail })));
const CompanyDetail = React.lazy(() => import('./features/crm/companies/CompanyDetail').then(m => ({ default: m.CompanyDetail })));
const PipelineBoard = React.lazy(() => import('./features/crm/deals/PipelineBoard').then(m => ({ default: m.PipelineBoard })));
const DealDetail = React.lazy(() => import('./features/crm/deals/DealDetail').then(m => ({ default: m.DealDetail })));
const ActivityTimeline = React.lazy(() => import('./features/crm/activities/ActivityTimeline').then(m => ({ default: m.ActivityTimeline })));

// Workflows
const WorkflowLayout = React.lazy(() => import('./features/workflows/WorkflowLayout').then(m => ({ default: m.WorkflowLayout })));
const WorkflowsList = React.lazy(() => import('./features/workflows/list').then(m => ({ default: m.WorkflowsList })));
const WorkflowTemplates = React.lazy(() => import('./features/workflows/list').then(m => ({ default: m.WorkflowTemplates })));
const WorkflowBuilderPage = React.lazy(() => import('./features/workflows/WorkflowBuilderPage').then(m => ({ default: m.WorkflowBuilderPage })));
const ExecutionLogs = React.lazy(() => import('./features/workflows/logs').then(m => ({ default: m.ExecutionLogs })));

// Marketing
const MarketingLayout = React.lazy(() => import('./features/marketing/MarketingLayout').then(m => ({ default: m.MarketingLayout })));
const MarketingDashboard = React.lazy(() => import('./features/marketing/analytics/MarketingDashboard').then(m => ({ default: m.MarketingDashboard })));
const EmailCampaignsList = React.lazy(() => import('./features/marketing/email/EmailCampaignsList').then(m => ({ default: m.EmailCampaignsList })));
const EmailCampaignBuilder = React.lazy(() => import('./features/marketing/email/EmailCampaignBuilder').then(m => ({ default: m.EmailCampaignBuilder })));
const EmailCampaignDetail = React.lazy(() => import('./features/marketing/email/EmailCampaignDetail').then(m => ({ default: m.EmailCampaignDetail })));
const SMSCampaignsList = React.lazy(() => import('./features/marketing/sms/SMSCampaignsList').then(m => ({ default: m.SMSCampaignsList })));
const SMSBuilder = React.lazy(() => import('./features/marketing/sms/SMSBuilder').then(m => ({ default: m.SMSBuilder })));
const SequenceBuilder = React.lazy(() => import('./features/marketing/sequences/SequenceBuilder').then(m => ({ default: m.SequenceBuilder })));
const SegmentBuilder = React.lazy(() => import('./features/marketing/segments/SegmentBuilder').then(m => ({ default: m.SegmentBuilder })));
const TemplatesList = React.lazy(() => import('./features/marketing/templates/TemplatesList').then(m => ({ default: m.TemplatesList })));
const TemplateEditor = React.lazy(() => import('./features/marketing/templates/TemplateEditor').then(m => ({ default: m.TemplateEditor })));

// Builder
const BuilderPage = React.lazy(() => import('./features/builder/BuilderPage').then(m => ({ default: m.BuilderPage })));

// AI Agents
const AIAgentsLayout = React.lazy(() => import('./features/ai-agents/AIAgentsLayout').then(m => ({ default: m.AIAgentsLayout })));
const AIAgentsOverview = React.lazy(() => import('./features/ai-agents/AIAgentsOverview').then(m => ({ default: m.AIAgentsOverview })));
const AIChat = React.lazy(() => import('./features/ai-agents/AIChat').then(m => ({ default: m.AIChat })));
const AIAnalytics = React.lazy(() => import('./features/ai-agents/AIAnalytics').then(m => ({ default: m.AIAnalytics })));
const AISettings = React.lazy(() => import('./features/ai-agents/AISettings').then(m => ({ default: m.AISettings })));
const AgentChatPage = React.lazy(() => import('./features/ai-agents/AgentChatPage').then(m => ({ default: m.AgentChatPage })));

// Integrations
const IntegrationsLayout = React.lazy(() => import('./features/integrations').then(m => ({ default: m.IntegrationsLayout })));
const ConnectionList = React.lazy(() => import('./features/integrations').then(m => ({ default: m.ConnectionList })));
const IntegrationRegistry = React.lazy(() => import('./features/integrations').then(m => ({ default: m.IntegrationRegistry })));

// Phone System
const PhoneLayout = React.lazy(() => import('./features/phone').then(m => ({ default: m.PhoneLayout })));
const Dialer = React.lazy(() => import('./features/phone').then(m => ({ default: m.Dialer })));
const CallsList = React.lazy(() => import('./features/phone').then(m => ({ default: m.CallsList })));
const CallDetails = React.lazy(() => import('./features/phone').then(m => ({ default: m.CallDetails })));
const VoicemailList = React.lazy(() => import('./features/phone').then(m => ({ default: m.VoicemailList })));
const SMSList = React.lazy(() => import('./features/phone').then(m => ({ default: m.SMSList })));
const SMSConversation = React.lazy(() => import('./features/phone').then(m => ({ default: m.SMSConversation })));
const NumbersList = React.lazy(() => import('./features/phone').then(m => ({ default: m.NumbersList })));

// Forms
const FormLayout = React.lazy(() => import('./features/forms').then(m => ({ default: m.FormLayout })));
const FormsList = React.lazy(() => import('./features/forms').then(m => ({ default: m.FormsList })));
const FormBuilder = React.lazy(() => import('./features/forms').then(m => ({ default: m.FormBuilder })));
const ConnectionWizard = React.lazy(() => import('./features/integrations').then(m => ({ default: m.ConnectionWizard })));
const WebhookList = React.lazy(() => import('./features/integrations').then(m => ({ default: m.WebhookList })));
const OAuthCallback = React.lazy(() => import('./features/integrations').then(m => ({ default: m.OAuthCallback })));

// Analytics
const AnalyticsLayout = React.lazy(() => import('./features/analytics/AnalyticsLayout').then(m => ({ default: m.AnalyticsLayout })));
const AnalyticsDashboard = React.lazy(() => import('./features/analytics/dashboards/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const DashboardList = React.lazy(() => import('./features/analytics/dashboards/DashboardList').then(m => ({ default: m.DashboardList })));
const ReportList = React.lazy(() => import('./features/analytics/reports/ReportList').then(m => ({ default: m.ReportList })));

// Chat Widget
const ChatLayout = React.lazy(() => import('./features/chat/ChatLayout').then(m => ({ default: m.ChatLayout })));
const ChatInbox = React.lazy(() => import('./features/chat/admin/ChatInbox').then(m => ({ default: m.ChatInbox })));
const ChatAnalytics = React.lazy(() => import('./features/chat/admin/ChatAnalytics').then(m => ({ default: m.ChatAnalytics })));
const ChatSettings = React.lazy(() => import('./features/chat/settings/ChatSettings').then(m => ({ default: m.ChatSettings })));

// Reputation Management
const ReputationLayout = React.lazy(() => import('./features/reputation/ReputationLayout').then(m => ({ default: m.ReputationLayout })));
const ReputationDashboard = React.lazy(() => import('./features/reputation/analytics/ReputationDashboard').then(m => ({ default: m.ReputationDashboard })));
const ReviewsList = React.lazy(() => import('./features/reputation/reviews/ReviewsList').then(m => ({ default: m.ReviewsList })));
const ReviewDetail = React.lazy(() => import('./features/reputation/reviews/ReviewDetail').then(m => ({ default: m.ReviewDetail })));
const SourcesList = React.lazy(() => import('./features/reputation/sources/SourcesList').then(m => ({ default: m.SourcesList })));
const ResponseTemplates = React.lazy(() => import('./features/reputation/responses/ResponseTemplates').then(m => ({ default: m.ResponseTemplates })));
const AlertsList = React.lazy(() => import('./features/reputation/alerts/AlertsList').then(m => ({ default: m.AlertsList })));

// Memberships
const MembershipLayout = React.lazy(() => import('./features/memberships/MembershipLayout').then(m => ({ default: m.MembershipLayout })));
const PlansList = React.lazy(() => import('./features/memberships/plans/PlansList').then(m => ({ default: m.PlansList })));
const MembersList = React.lazy(() => import('./features/memberships/members/MembersList').then(m => ({ default: m.MembersList })));
const ContentLibrary = React.lazy(() => import('./features/memberships/content/ContentLibrary').then(m => ({ default: m.ContentLibrary })));
const PaymentsList = React.lazy(() => import('./features/memberships/payments/PaymentsList').then(m => ({ default: m.PaymentsList })));
const MemberPortal = React.lazy(() => import('./features/memberships/portal/MemberPortal').then(m => ({ default: m.MemberPortal })));

// Calendar & Appointments
const CalendarLayout = React.lazy(() => import('./features/calendar').then(m => ({ default: m.CalendarLayout })));
const CalendarView = React.lazy(() => import('./features/calendar').then(m => ({ default: m.CalendarView })));
const AppointmentsList = React.lazy(() => import('./features/calendar').then(m => ({ default: m.AppointmentsList })));
const AvailabilityEditor = React.lazy(() => import('./features/calendar').then(m => ({ default: m.AvailabilityEditor })));
const BookingPage = React.lazy(() => import('./features/calendar').then(m => ({ default: m.BookingPage })));

const Sites = React.lazy(() => import('./features/builder/SitesPage').then(m => ({ default: m.SitesPage })));

// Wrapper components for route parameter passing
const MemberPortalWrapper = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  if (!organizationId) return <Navigate to="/" />;
  return <MemberPortal organizationId={organizationId} />;
};

const CallDetailsWrapper = () => {
  const { callId } = useParams<{ callId: string }>();
  if (!callId) return <Navigate to="/dashboard/phone/calls" />;
  return <CallDetails callId={callId} />;
};

const ChatInboxWrapper = () => {
  const { currentOrganization } = useAuth();
  if (!currentOrganization?.id) return <div>Loading organization...</div>;
  return <ChatInbox organizationId={currentOrganization.id} />;
};

const ChatAnalyticsWrapper = () => {
  const { currentOrganization } = useAuth();
  if (!currentOrganization?.id) return <div>Loading organization...</div>;
  return <ChatAnalytics organizationId={currentOrganization.id} />;
};

const ChatSettingsWrapper = () => {
  const { currentOrganization } = useAuth();
  if (!currentOrganization?.id) return <div>Loading organization...</div>;
  return <ChatSettings organizationId={currentOrganization.id} />;
};

const WebhookListWrapper = () => {
  const { connectionId } = useParams<{ connectionId: string }>();
  if (!connectionId) return <div>Select a connection first</div>;
  return <WebhookList connectionId={connectionId} />;
};

const PlansListWrapper = () => {
  const { currentOrganization } = useAuth();
  if (!currentOrganization?.id) return <div>Loading organization...</div>;
  return <PlansList organizationId={currentOrganization.id} />;
};

const MembersListWrapper = () => {
  const { currentOrganization } = useAuth();
  if (!currentOrganization?.id) return <div>Loading organization...</div>;
  return <MembersList organizationId={currentOrganization.id} />;
};

const ContentLibraryWrapper = () => {
  const { currentOrganization } = useAuth();
  if (!currentOrganization?.id) return <div>Loading organization...</div>;
  return <ContentLibrary organizationId={currentOrganization.id} />;
};

const PaymentsListWrapper = () => {
  const { currentOrganization } = useAuth();
  if (!currentOrganization?.id) return <div>Loading organization...</div>;
  return <PaymentsList organizationId={currentOrganization.id} />;
};

const PageLoader = () => (
  <div className="flex h-full items-center justify-center bg-transparent">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <FeatureProvider>
              <ToastProvider>
                <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading App...</div>}>
                  <Routes>
              {/* Landing page - public route, handles authenticated redirect internally */}
              <Route path="/" element={<LandingPage />} />

              {/* Auth page - direct login/signup access */}
              <Route path="/auth" element={
                <ProtectedRoute requireAuth={false}>
                  <AuthPage />
                </ProtectedRoute>
              } />

              <Route path="/audit" element={
                <Suspense fallback={<PageLoader />}>
                  <AuditIntakePage />
                </Suspense>
              } />

              {/* Onboarding - for authenticated users without organization */}
              <Route path="/onboarding" element={
                <Suspense fallback={<PageLoader />}>
                  <OnboardingWizard />
                </Suspense>
              } />

              {/* Password Reset */}
              <Route path="/reset-password" element={
                <Suspense fallback={<PageLoader />}>
                  <ResetPasswordPage />
                </Suspense>
              } />

              {/* Invitation Acceptance */}
              <Route path="/invite/:token" element={
                <Suspense fallback={<PageLoader />}>
                  <AcceptInvitationPage />
                </Suspense>
              } />

              {/* Marketing/Legal Pages - public routes */}
              <Route path="/privacy" element={
                <Suspense fallback={<PageLoader />}>
                  <PrivacyPage />
                </Suspense>
              } />
              <Route path="/terms" element={
                <Suspense fallback={<PageLoader />}>
                  <TermsPage />
                </Suspense>
              } />
              <Route path="/contact" element={
                <Suspense fallback={<PageLoader />}>
                  <ContactPage />
                </Suspense>
              } />
              <Route path="/cookies" element={
                <Suspense fallback={<PageLoader />}>
                  <CookiePolicyPage />
                </Suspense>
              } />
              <Route path="/gdpr" element={
                <Suspense fallback={<PageLoader />}>
                  <GdprPage />
                </Suspense>
              } />
              <Route path="/security" element={
                <Suspense fallback={<PageLoader />}>
                  <SecurityPage />
                </Suspense>
              } />
              <Route path="/about" element={
                <Suspense fallback={<PageLoader />}>
                  <AboutPage />
                </Suspense>
              } />
              <Route path="/blog" element={
                <Suspense fallback={<PageLoader />}>
                  <PublicResourcePage pageId="blog" />
                </Suspense>
              } />
              <Route path="/careers" element={
                <Suspense fallback={<PageLoader />}>
                  <PublicResourcePage pageId="careers" />
                </Suspense>
              } />
              <Route path="/partners" element={
                <Suspense fallback={<PageLoader />}>
                  <PublicResourcePage pageId="partners" />
                </Suspense>
              } />
              <Route path="/docs" element={
                <Suspense fallback={<PageLoader />}>
                  <PublicResourcePage pageId="docs" />
                </Suspense>
              } />
              <Route path="/help" element={
                <Suspense fallback={<PageLoader />}>
                  <PublicResourcePage pageId="help" />
                </Suspense>
              } />
              <Route path="/community" element={
                <Suspense fallback={<PageLoader />}>
                  <PublicResourcePage pageId="community" />
                </Suspense>
              } />
              <Route path="/templates" element={
                <Suspense fallback={<PageLoader />}>
                  <PublicResourcePage pageId="templates" />
                </Suspense>
              } />
              <Route path="/status" element={
                <Suspense fallback={<PageLoader />}>
                  <PublicResourcePage pageId="status" />
                </Suspense>
              } />

              {/* Public Member Portal */}
              <Route path="/portal/:organizationId" element={
                <Suspense fallback={<PageLoader />}>
                  <MemberPortalWrapper />
                </Suspense>
              } />

              {/* Public Booking Page */}
              <Route path="/booking/:bookingPageId" element={
                <Suspense fallback={<PageLoader />}>
                  <BookingPage />
                </Suspense>
              } />

              {/* Protected routes - require authentication, base at /dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                } />

                <Route path="audits" element={
                  <Suspense fallback={<PageLoader />}>
                    <AuditListPage />
                  </Suspense>
                } />
                <Route path="audits/:auditId" element={
                  <Suspense fallback={<PageLoader />}>
                    <AuditDetailPage />
                  </Suspense>
                } />
                <Route path="audit-ops" element={
                  <Suspense fallback={<PageLoader />}>
                    <AuditOpsPage />
                  </Suspense>
                } />
                
                <Route path="crm" element={
                  <FeatureGuard moduleId="crm" redirectTo="/dashboard">
                    <Suspense fallback={<PageLoader />}>
                      <CrmLayout />
                    </Suspense>
                  </FeatureGuard>
                }>
                  <Route index element={<Navigate to="contacts" replace />} />
                  <Route path="contacts" element={<ContactList />} />
                  <Route path="contacts/:id" element={<ContactDetail />} />
                  <Route path="companies" element={<CompanyList />} />
                  <Route path="companies/:id" element={<CompanyDetail />} />
                  <Route path="deals" element={<PipelineBoard />} />
                  <Route path="deals/:id" element={<DealDetail />} />
                  <Route path="activities" element={<ActivityTimeline />} />
                </Route>

                <Route path="sites" element={
                  <FeatureGuard moduleId="site_builder" redirectTo="/dashboard">
                    <Outlet />
                  </FeatureGuard>
                }>
                  <Route index element={
                    <Suspense fallback={<PageLoader />}>
                      <Sites />
                    </Suspense>
                  } />
                  <Route path="builder/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <BuilderPage />
                    </Suspense>
                  } />
                </Route>

                {/* Workflow Module Routes */}
                <Route path="workflows" element={
                  <Suspense fallback={<PageLoader />}>
                    <WorkflowLayout />
                  </Suspense>
                }>
                  <Route index element={
                    <Suspense fallback={<PageLoader />}>
                      <WorkflowsList />
                    </Suspense>
                  } />
                  <Route path="templates" element={
                    <Suspense fallback={<PageLoader />}>
                      <WorkflowTemplates />
                    </Suspense>
                  } />
                  <Route path="logs" element={
                    <Suspense fallback={<PageLoader />}>
                      <ExecutionLogs />
                    </Suspense>
                  } />
                  <Route path="new" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <WorkflowBuilderPage />
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path=":workflowId" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <WorkflowBuilderPage />
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path=":workflowId/logs" element={
                    <Suspense fallback={<PageLoader />}>
                      <ExecutionLogs />
                    </Suspense>
                  } />
                </Route>
                
                {/* Marketing Module Routes */}
                <Route path="marketing" element={
                  <Suspense fallback={<PageLoader />}>
                    <MarketingLayout />
                  </Suspense>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />

                  {/* Dashboard */}
                  <Route path="dashboard" element={
                    <Suspense fallback={<PageLoader />}>
                      <MarketingDashboard />
                    </Suspense>
                  } />

                  {/* Email Campaigns */}
                  <Route path="email" element={
                    <Suspense fallback={<PageLoader />}>
                      <EmailCampaignsList />
                    </Suspense>
                  } />
                  <Route path="email/new" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <EmailCampaignBuilder />
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path="email/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <EmailCampaignDetail />
                    </Suspense>
                  } />

                  {/* SMS Campaigns */}
                  <Route path="sms" element={
                    <Suspense fallback={<PageLoader />}>
                      <SMSCampaignsList />
                    </Suspense>
                  } />
                  <Route path="sms/new" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <SMSBuilder />
                      </Suspense>
                    </RoleGuard>
                  } />

                  {/* Sequences */}
                  <Route path="sequences" element={
                    <Suspense fallback={<PageLoader />}>
                      <SequenceBuilder />
                    </Suspense>
                  } />
                  <Route path="sequences/new" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <SequenceBuilder />
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path="sequences/:id" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <SequenceBuilder />
                      </Suspense>
                    </RoleGuard>
                  } />

                  {/* Segments */}
                  <Route path="segments" element={
                    <Suspense fallback={<PageLoader />}>
                      <SegmentBuilder />
                    </Suspense>
                  } />
                  <Route path="segments/new" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <SegmentBuilder />
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path="segments/:id" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <SegmentBuilder />
                      </Suspense>
                    </RoleGuard>
                  } />

                  {/* Templates */}
                  <Route path="templates" element={
                    <Suspense fallback={<PageLoader />}>
                      <TemplatesList />
                    </Suspense>
                  } />
                  <Route path="templates/new" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <TemplateEditor />
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path="templates/:id" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <TemplateEditor />
                      </Suspense>
                    </RoleGuard>
                  } />

                  {/* Analytics */}
                  <Route path="analytics" element={
                    <Suspense fallback={<PageLoader />}>
                      <MarketingDashboard />
                    </Suspense>
                  } />
                </Route>

                {/* AI Agents Module Routes */}
                <Route path="ai-agents" element={
                  <FeatureGuard moduleId="ai_agents" redirectTo="/dashboard">
                    <Suspense fallback={<PageLoader />}>
                      <AIAgentsLayout />
                    </Suspense>
                  </FeatureGuard>
                }>
                  <Route index element={
                    <Suspense fallback={<PageLoader />}>
                      <AIAgentsOverview />
                    </Suspense>
                  } />
                  <Route path="chat" element={
                    <Suspense fallback={<PageLoader />}>
                      <AIChat />
                    </Suspense>
                  } />
                  <Route path=":agentId/chat" element={
                    <Suspense fallback={<PageLoader />}>
                      <AgentChatPage />
                    </Suspense>
                  } />
                  <Route path="analytics" element={
                    <Suspense fallback={<PageLoader />}>
                      <AIAnalytics />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<PageLoader />}>
                      <AISettings />
                    </Suspense>
                  } />
                </Route>

                {/* Forms Module Routes */}
                <Route path="forms" element={
                  <FeatureGuard moduleId="forms" redirectTo="/dashboard">
                    <Suspense fallback={<PageLoader />}>
                      <FormLayout />
                    </Suspense>
                  </FeatureGuard>
                }>
                  <Route index element={
                    <Suspense fallback={<PageLoader />}>
                      <FormsList />
                    </Suspense>
                  } />
                  <Route path="new" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <FormBuilder />
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path=":formId" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <FormBuilder />
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path=":formId/submissions" element={
                    <Suspense fallback={<PageLoader />}>
                      <div className="p-4">Submissions (Coming Soon)</div>
                    </Suspense>
                  } />
                  <Route path=":formId/analytics" element={
                    <Suspense fallback={<PageLoader />}>
                      <div className="p-4">Analytics (Coming Soon)</div>
                    </Suspense>
                  } />
                  <Route path=":formId/embed" element={
                    <Suspense fallback={<PageLoader />}>
                      <div className="p-4">Embed Code (Coming Soon)</div>
                    </Suspense>
                  } />
                </Route>

                {/* Analytics Module Routes */}
                <Route path="analytics" element={
                  <FeatureGuard moduleId="analytics" redirectTo="/dashboard">
                    <Suspense fallback={<PageLoader />}>
                      <AnalyticsLayout />
                    </Suspense>
                  </FeatureGuard>
                }>
                  <Route index element={
                    <Suspense fallback={<PageLoader />}>
                      <AnalyticsDashboard />
                    </Suspense>
                  } />
                  <Route path="dashboards" element={
                    <Suspense fallback={<PageLoader />}>
                      <DashboardList />
                    </Suspense>
                  } />
                  <Route path="dashboards/new" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <div className="p-4">Dashboard Builder (Coming Soon)</div>
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path="reports" element={
                    <Suspense fallback={<PageLoader />}>
                      <ReportList />
                    </Suspense>
                  } />
                  <Route path="reports/new" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <div className="p-4">Report Builder (Coming Soon)</div>
                      </Suspense>
                    </RoleGuard>
                  } />
                </Route>

                {/* Chat Widget Module Routes */}
                <Route path="chat" element={
                  <FeatureGuard moduleId="chat_widget" redirectTo="/dashboard">
                    <Suspense fallback={<PageLoader />}>
                      <ChatLayout />
                    </Suspense>
                  </FeatureGuard>
                }>
                  <Route index element={
                    <Suspense fallback={<PageLoader />}>
                      <ChatInboxWrapper />
                    </Suspense>
                  } />
                  <Route path="analytics" element={
                    <Suspense fallback={<PageLoader />}>
                      <ChatAnalyticsWrapper />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <ChatSettingsWrapper />
                      </Suspense>
                    </RoleGuard>
                  } />
                </Route>

                {/* Integrations Module Routes */}
                <Route path="integrations" element={
                  <FeatureGuard moduleId="integrations" redirectTo="/dashboard">
                    <Suspense fallback={<PageLoader />}>
                      <IntegrationsLayout />
                    </Suspense>
                  </FeatureGuard>
                }>
                  <Route index element={
                    <Suspense fallback={<PageLoader />}>
                      <ConnectionList />
                    </Suspense>
                  } />
                  <Route path="registry" element={
                    <Suspense fallback={<PageLoader />}>
                      <IntegrationRegistry />
                    </Suspense>
                  } />
                  <Route path="new/:integrationId" element={
                    <Suspense fallback={<PageLoader />}>
                      <ConnectionWizard />
                    </Suspense>
                  } />
                  <Route path=":connectionId/webhooks" element={
                    <Suspense fallback={<PageLoader />}>
                      <WebhookListWrapper />
                    </Suspense>
                  } />
                </Route>

                {/* OAuth Callback (outside layout) */}
                <Route path="integrations/oauth/callback" element={
                  <Suspense fallback={<PageLoader />}>
                    <OAuthCallback />
                  </Suspense>
                } />

                {/* Membership Module Routes */}
                <Route path="memberships" element={
                  <FeatureGuard moduleId="membership" redirectTo="/dashboard">
                    <Suspense fallback={<PageLoader />}>
                      <MembershipLayout />
                    </Suspense>
                  </FeatureGuard>
                }>
                  <Route index element={<Navigate to="plans" replace />} />
                  <Route path="plans" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <PlansListWrapper />
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path="members" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <MembersListWrapper />
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path="content" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <ContentLibraryWrapper />
                      </Suspense>
                    </RoleGuard>
                  } />
                  <Route path="payments" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <PaymentsListWrapper />
                      </Suspense>
                    </RoleGuard>
                  } />
                </Route>

                {/* Calendar & Appointments Module Routes */}
                <Route path="calendar" element={
                  <FeatureGuard moduleId="appointments" redirectTo="/dashboard">
                    <Suspense fallback={<PageLoader />}>
                      <CalendarLayout />
                    </Suspense>
                  </FeatureGuard>
                }>
                  <Route index element={
                    <Suspense fallback={<PageLoader />}>
                      <CalendarView />
                    </Suspense>
                  } />
                  <Route path="appointments" element={
                    <Suspense fallback={<PageLoader />}>
                      <AppointmentsList />
                    </Suspense>
                  } />
                  <Route path="availability" element={
                    <Suspense fallback={<PageLoader />}>
                      <AvailabilityEditor />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <div className="p-4">Calendar Settings (Coming Soon)</div>
                      </Suspense>
                    </RoleGuard>
                  } />
                </Route>

                {/* Phone System Module Routes */}
                <Route path="phone" element={
                  <FeatureGuard moduleId="phone_system" redirectTo="/dashboard">
                    <Suspense fallback={<PageLoader />}>
                      <PhoneLayout />
                    </Suspense>
                  </FeatureGuard>
                }>
                  <Route index element={
                    <Suspense fallback={<PageLoader />}>
                      <Dialer />
                    </Suspense>
                  } />
                  <Route path="calls" element={
                    <Suspense fallback={<PageLoader />}>
                      <CallsList />
                    </Suspense>
                  } />
                  <Route path="calls/:callId" element={
                    <Suspense fallback={<PageLoader />}>
                      <CallDetailsWrapper />
                    </Suspense>
                  } />
                  <Route path="voicemail" element={
                    <Suspense fallback={<PageLoader />}>
                      <VoicemailList />
                    </Suspense>
                  } />
                  <Route path="sms" element={
                    <Suspense fallback={<PageLoader />}>
                      <SMSList />
                    </Suspense>
                  } />
                  <Route path="sms/:threadId" element={
                    <Suspense fallback={<PageLoader />}>
                      <SMSConversation />
                    </Suspense>
                  } />
                  <Route path="numbers" element={
                    <Suspense fallback={<PageLoader />}>
                      <NumbersList />
                    </Suspense>
                  } />
                </Route>

                {/* Reputation Management Routes */}
                <Route path="reputation" element={
                  <FeatureGuard moduleId="reputation" redirectTo="/dashboard">
                    <Suspense fallback={<PageLoader />}>
                      <ReputationLayout />
                    </Suspense>
                  </FeatureGuard>
                }>
                  <Route index element={
                    <Suspense fallback={<PageLoader />}>
                      <ReputationDashboard />
                    </Suspense>
                  } />
                  <Route path="reviews" element={
                    <Suspense fallback={<PageLoader />}>
                      <ReviewsList />
                    </Suspense>
                  } />
                  <Route path="reviews/:reviewId" element={
                    <Suspense fallback={<PageLoader />}>
                      <ReviewDetail />
                    </Suspense>
                  } />
                  <Route path="sources" element={
                    <Suspense fallback={<PageLoader />}>
                      <SourcesList />
                    </Suspense>
                  } />
                  <Route path="responses" element={
                    <Suspense fallback={<PageLoader />}>
                      <ResponseTemplates />
                    </Suspense>
                  } />
                  <Route path="alerts" element={
                    <Suspense fallback={<PageLoader />}>
                      <AlertsList />
                    </Suspense>
                  } />
                </Route>

                {/* Settings */}
                <Route path="settings" element={
                  <Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                  </Suspense>
                } />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
              {/* Legacy redirect: old / paths now at /dashboard */}
              <Route path="/crm" element={<Navigate to="/dashboard/crm" replace />} />
              <Route path="/audits" element={<Navigate to="/dashboard/audits" replace />} />
              <Route path="/sites" element={<Navigate to="/dashboard/sites" replace />} />
              <Route path="/workflows" element={<Navigate to="/dashboard/workflows" replace />} />
              <Route path="/marketing" element={<Navigate to="/dashboard/marketing" replace />} />
              <Route path="/ai-agents" element={<Navigate to="/dashboard/ai-agents" replace />} />
              <Route path="/forms" element={<Navigate to="/dashboard/forms" replace />} />
              <Route path="/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
              <Route path="/chat" element={<Navigate to="/dashboard/chat" replace />} />
              <Route path="/integrations" element={<Navigate to="/dashboard/integrations" replace />} />
              <Route path="/memberships" element={<Navigate to="/dashboard/memberships" replace />} />
              <Route path="/calendar" element={<Navigate to="/dashboard/calendar" replace />} />
              <Route path="/phone" element={<Navigate to="/dashboard/phone" replace />} />
              <Route path="/reputation" element={<Navigate to="/dashboard/reputation" replace />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </FeatureProvider>
      </AuthProvider>
    </Router>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
