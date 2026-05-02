import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Lock, Cookie } from 'lucide-react';

export const PrivacyPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => navigate('/auth?mode=login');
  const handleStartTrial = () => navigate('/auth?mode=signup');

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <MarketingHeader
        isScrolled={false}
        onSignIn={handleSignIn}
        onStartTrial={handleStartTrial}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-text-secondary">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Information We Collect
            </h2>
            <p className="text-text-secondary leading-relaxed">
              We collect information you provide directly to us, including when you create an account, use our services,
              or communicate with us. This includes:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
              <li>Account information (name, email address, password)</li>
              <li>Profile information (avatar, organization details)</li>
              <li>Usage data (features used, time spent, actions taken)</li>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Communications (support requests, feedback, surveys)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              How We Use Your Information
            </h2>
            <p className="text-text-secondary leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
              <li>To process transactions and send related information</li>
              <li>To send technical notices, updates, security alerts, and support messages</li>
              <li>To respond to comments, questions, and customer service requests</li>
              <li>To communicate about products, services, and events</li>
              <li>To monitor and analyze trends, usage, and activities</li>
              <li>To detect, prevent, and address technical issues and fraudulent activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary" />
              Cookies and Tracking
            </h2>
            <p className="text-text-secondary leading-relaxed">
              We use cookies and similar tracking technologies to collect and track information about your activities on our
              service. We use cookies for:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
              <li>Authentication and security</li>
              <li>Remembering your preferences</li>
              <li>Analytics and usage tracking</li>
              <li>Personalization and feature improvements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-text-secondary leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over
              the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-text-secondary leading-relaxed">
              You have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your personal information</li>
              <li>Objection to processing of your personal information</li>
              <li>Data portability</li>
              <li>Withdrawal of consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-text-secondary leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-text-primary mt-4">
              <a href="mailto:privacy@flowstack.com" className="text-primary hover:underline">
                privacy@flowstack.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter onStartTrial={handleStartTrial} />
    </div>
  );
};
