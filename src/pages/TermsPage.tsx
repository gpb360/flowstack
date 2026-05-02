import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, AlertCircle, CreditCard } from 'lucide-react';

export const TermsPage = () => {
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
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-text-secondary">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Acceptance of Terms
            </h2>
            <p className="text-text-secondary leading-relaxed">
              By accessing or using FlowStack ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p className="text-text-secondary leading-relaxed">
              FlowStack provides an all-in-one business automation platform including CRM, marketing automation,
              AI agents, workflow automation, site builder, and related services. We reserve the right to modify,
              suspend, or discontinue the Service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              User Responsibilities
            </h2>
            <p className="text-text-secondary leading-relaxed">
              As a user of the Service, you agree to:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
              <li>Not transmit viruses, malware, or harmful code</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Not harass, abuse, or harm other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Terms
            </h2>
            <p className="text-text-secondary leading-relaxed">
              The Service offers both free and paid subscription plans. Paid subscriptions are billed in advance on a
              monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to
              change our pricing at any time with 30 days notice.
            </p>
            <p className="text-text-secondary leading-relaxed mt-4">
              For the Starter plan ($97/month) and Professional plan ($297/month), you may cancel at any time.
              Enterprise plans require a custom contract with minimum commitment periods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
            <p className="text-text-secondary leading-relaxed">
              The Service and its original content, features, and functionality are owned by FlowStack and are
              protected by international copyright, trademark, and other intellectual property laws. You retain ownership
              of any data you provide to the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p className="text-text-secondary leading-relaxed">
              We may terminate or suspend your account and access to the Service at our sole discretion, without
              prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or
              third parties, or for any other reason. Upon termination, your right to use the Service will immediately
              cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
            <p className="text-text-secondary leading-relaxed">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties
              of any kind, express or implied, regarding the Service, including but not limited to implied warranties
              of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-text-secondary leading-relaxed">
              To the fullest extent permitted by law, FlowStack shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including but not limited to loss of profits, data, use,
              goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p className="text-text-secondary leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
              FlowStack is registered, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-text-secondary leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by
              posting the new Terms on this page. Your continued use of the Service after such modifications constitutes
              your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-text-secondary leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-text-primary mt-4">
              <a href="mailto:legal@flowstack.com" className="text-primary hover:underline">
                legal@flowstack.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter onStartTrial={handleStartTrial} />
    </div>
  );
};
