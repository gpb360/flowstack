import { Outlet } from 'react-router-dom';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { useNavigate } from 'react-router-dom';

export const MarketingLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth?mode=login');
  };

  const handleStartTrial = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader
        isScrolled={false}
        onSignIn={handleSignIn}
        onStartTrial={handleStartTrial}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter onStartTrial={handleStartTrial} />
    </div>
  );
};
