import { useState } from 'react';

function SortingSidebar({ onSortChange, currentSort, sortOrder, selectedSource }) {
  const [showSourceMenu, setShowSourceMenu] = useState(false);

  const sources = [
    'All Sources',
    'ITJobs',
    'Adzuna',
    'SapoEmpregos',
    'SapoEmpregosPT'
  ];

  const getSortIcon = (option) => {
    if (option !== currentSort) return null;
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  return (
    <div className="w-24 md:w-48 border-r border-gray-700 p-2 md:p-4 min-h-screen fixed left-0 top-0 pt-24 md:pt-32 bg-gray-800 dark:bg-dark-secondary">
      <h3 className="text-white font-semibold mb-2 md:mb-4 text-sm md:text-base">Sort Jobs By</h3>
      <div className="space-y-1 md:space-y-2">
        {['salary', 'date', 'company', 'source'].map((option) => (
          <div key={option}>
            {option === 'source' ? (
              <div>
                <button
                  onClick={() => setShowSourceMenu(!showSourceMenu)}
                  className="w-full text-left px-2 md:px-3 py-1 md:py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors flex justify-between items-center text-xs md:text-base"
                >
                  
                  <span>Source</span>
                  <span>{showSourceMenu ? '▼' : '▶'}</span>
                </button>
                {showSourceMenu && (
                  <div className="ml-0 md:ml-4 mt-1 space-y-1">
                    {sources.map(source => (
                      <button
                        key={source}
                        onClick={() => onSortChange('source', source)}
                        className={`w-full text-left px-2 md:px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded text-xs md:text-sm ${
                          selectedSource === source ? 'bg-gray-700' : ''
                        }`}
                      >
                        {source}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onSortChange(option)}
                className="w-full text-left px-2 md:px-3 py-1 md:py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors flex justify-between items-center text-xs md:text-base"
              >
                <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                <span>{getSortIcon(option)}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SortingSidebar;
