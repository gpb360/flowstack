import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { useNavigate } from 'react-router-dom';
import { Cookie as CookieIcon } from 'lucide-react';

export const CookiePolicyPage = () => {
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
              <CookieIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-text-secondary">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
            <p className="text-text-secondary leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide
              you with a better experience by remembering your preferences and understanding how you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
            <p className="text-text-secondary leading-relaxed">
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication
              and security.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website by collecting anonymous
              usage data.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences to provide enhanced features.</li>
              <li><strong>Marketing Cookies:</strong> Track visitors across websites to display relevant advertisements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
            <p className="text-text-secondary leading-relaxed">
              We may use third-party services that place cookies on your device. These services include:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
              <li>Google Analytics (analytics)</li>
              <li>Google Ads (marketing)</li>
              <li>Facebook Pixel (marketing)</li>
              <li>Intercom (support and chat)</li>
              <li>Supabase (authentication and database)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
            <p className="text-text-secondary leading-relaxed">
              You can control and manage cookies in various ways. Please note that removing or blocking cookies may impact
              your user experience and parts of our website may no longer be fully accessible.
            </p>
            <p className="text-text-secondary leading-relaxed mt-4">
              Most web browsers allow you to:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block all cookies from being set</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Browser Settings</h2>
            <p className="text-text-secondary leading-relaxed">
              To manage cookies through your browser:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
              <li><strong>Chrome:</strong> Settings {'>'} Privacy and security {'>'} Cookies and other site data</li>
              <li><strong>Firefox:</strong> Options {'>'} Privacy {'&'} Security {'>'} Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences {'>'} Privacy {'>'} Manage Website Data</li>
              <li><strong>Edge:</strong> Settings {'>'} Cookies and site permissions {'>'} Manage cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
            <p className="text-text-secondary leading-relaxed">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated
              revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-text-secondary leading-relaxed">
              If you have questions about our use of cookies, please contact us at:
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
