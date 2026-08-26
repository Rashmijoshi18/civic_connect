import { AlertTriangle, FileX, Search, Lightbulb } from 'lucide-react';

const icons = { empty: FileX, search: Search, error: AlertTriangle, solutions: Lightbulb };

const EmptyState = ({ icon = 'empty', title = 'Nothing here yet', description = '', action }) => {
  const Icon = icons[icon] || FileX;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-dark-400" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-dark-300 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
