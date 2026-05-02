import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';

export const GdprPage = () => {
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
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">GDPR Compliance</h1>
          </div>
          <p className="text-text-secondary">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-text-secondary leading-relaxed">
              FlowStack is committed to protecting your personal data and respecting your privacy. This page explains how
              we comply with the General Data Protection Regulation (GDPR) and your rights under this regulation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Controller</h2>
            <p className="text-text-secondary leading-relaxed">
              FlowStack is the data controller responsible for your personal information. You can contact us at:
            </p>
            <p className="text-text-primary mt-4">
              <a href="mailto:privacy@flowstack.com" className="text-primary hover:underline">
                privacy@flowstack.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Legal Basis for Processing</h2>
            <p className="text-text-secondary leading-relaxed">
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
              <li><strong>Contract:</strong> Processing necessary to provide our services under our agreement</li>
              <li><strong>Consent:</strong> When you explicitly consent to specific processing activities</li>
              <li><strong>Legal Obligation:</strong> To comply with legal and regulatory requirements</li>
              <li><strong>Legitimate Interests:</strong> For fraud prevention, security, and service improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your GDPR Rights</h2>
            <p className="text-text-secondary leading-relaxed">
              Under GDPR, you have the following rights regarding your personal data:
            </p>

            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-surface border border-border">
                <h3 className="font-semibold text-text-primary mb-2">Right to Access</h3>
                <p className="text-text-secondary text-sm">
                  You can request a copy of the personal data we hold about you, including processing activities and
                  recipients of your data.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface border border-border">
                <h3 className="font-semibold text-text-primary mb-2">Right to Rectification</h3>
                <p className="text-text-secondary text-sm">
                  You can request correction of inaccurate or incomplete personal data.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface border border-border">
                <h3 className="font-semibold text-text-primary mb-2">Right to Erasure</h3>
                <p className="text-text-secondary text-sm">
                  You can request deletion of your personal data, subject to legal retention requirements.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface border border-border">
                <h3 className="font-semibold text-text-primary mb-2">Right to Restrict Processing</h3>
                <p className="text-text-secondary text-sm">
                  You can request limitation of how we process your data in certain circumstances.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface border border-border">
                <h3 className="font-semibold text-text-primary mb-2">Right to Data Portability</h3>
                <p className="text-text-secondary text-sm">
                  You can receive your data in a structured, commonly used format and transfer it to another service.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface border border-border">
                <h3 className="font-semibold text-text-primary mb-2">Right to Object</h3>
                <p className="text-text-secondary text-sm">
                  You can object to certain types of processing based on legitimate interests or direct marketing.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface border border-border">
                <h3 className="font-semibold text-text-primary mb-2">Right to Withdraw Consent</h3>
                <p className="text-text-secondary text-sm">
                  You can withdraw your consent at any time where we rely on consent as the legal basis.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Subject Requests</h2>
            <p className="text-text-secondary leading-relaxed">
              To exercise your GDPR rights, please contact us at{' '}
              <a href="mailto:privacy@flowstack.com" className="text-primary hover:underline">
                privacy@flowstack.com
              </a>
              . We will respond to your request within 30 days of receipt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Breaches</h2>
            <p className="text-text-secondary leading-relaxed">
              In the event of a personal data breach that poses a risk to your rights and freedoms, we will notify you
              without undue delay and, where feasible, within 72 hours of becoming aware of the breach.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
            <p className="text-text-secondary leading-relaxed">
              Your personal data may be transferred to and processed in countries other than your own. We ensure adequate
              safeguards are in place to protect your data in accordance with GDPR requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-text-secondary leading-relaxed">
              For GDPR-related inquiries or to exercise your rights, please contact our Data Protection Officer at:
            </p>
            <p className="text-text-primary mt-4">
              <a href="mailto:dpo@flowstack.com" className="text-primary hover:underline">
                dpo@flowstack.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter onStartTrial={handleStartTrial} />
    </div>
  );
};
