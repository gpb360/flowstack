import { useNavigate } from 'react-router-dom';
import { WidgetWrapper } from '../components/WidgetWrapper';

export const QuickActionsWidget = () => {
  const navigate = useNavigate();

  return (
    <WidgetWrapper title="Quick Actions">
      <div className="grid grid-cols-1 gap-3">
        <button 
          onClick={() => navigate('/crm/contacts')}
          className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <span className="text-xl leading-none">+</span>
          </div>
          <span className="font-medium text-gray-700">Add New Contact</span>
        </button>
        
        <button 
          onClick={() => navigate('/crm/companies')}
          className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <span className="text-xl leading-none">+</span>
          </div>
          <span className="font-medium text-gray-700">Add New Company</span>
        </button>
      </div>
    </WidgetWrapper>
  );
};
