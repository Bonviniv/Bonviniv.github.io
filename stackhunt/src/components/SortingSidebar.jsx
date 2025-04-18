import { useState } from 'react';

function SortingSidebar({ onSortChange, currentSort, sortOrder }) {
  const getSortIcon = (option) => {
    if (option !== currentSort) return null;
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  return (
    <div className="w-48 border-r border-gray-700 p-4 min-h-screen fixed left-0 top-0 pt-32 bg-gray-800 dark:bg-dark-secondary">
      <h3 className="text-white font-semibold mb-4">Sort Jobs By</h3>
      <div className="space-y-2">
        {['salary', 'date', 'company'].map((option) => (
          <button
            key={option}
            onClick={() => onSortChange(option)}
            className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors flex justify-between items-center"
          >
            <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
            <span>{getSortIcon(option)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SortingSidebar;
