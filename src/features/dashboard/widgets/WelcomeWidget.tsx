import { useAuth } from '../../../context/AuthContext';

export const WelcomeWidget = () => {
  const { session } = useAuth();
  const userName = session?.user?.email?.split('@')[0] || 'User';
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 h-full flex flex-col justify-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        {getGreeting()}, <span className="text-blue-600 capitalize">{userName}</span>
      </h2>
      <p className="text-gray-600 text-lg">
        Here's what's happening in your workspace today.
      </p>
    </div>
  );
};
