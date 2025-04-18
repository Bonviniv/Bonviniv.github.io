import { useState } from 'react';

function Filters({ onSearch, isLoading }) {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      keywords: keywords.trim(),
      location: location.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="-w-[500%] md:w-[70%] transform scale-80 md:transform-none origin-left -ml-20 md:ml-12">
      <div className="grid grid-cols-3 md:grid-cols-12 gap-12 md:gap-4 -mr-9 md:mr-0">
        <input
          type="text"
          placeholder="Keywords (e.g. JavaScript, React)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="w-[1300%] -ml-8 pl-1.5 pr-0 md:w-full md:p-2 text-sm md:text-base rounded bg-gray-700 text-white col-span-1 md:col-span-5"
        />
        <input
          type="text"
          placeholder="Location (e.g. Lisbon, Remote)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-[1300%] ml-2 pl-1.5 pr-0 md:w-full md:p-2 text-sm md:text-base rounded bg-gray-700 text-white col-span-1 md:col-span-5"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-[900%] ml-12 pl-1.5 pr-0 md:w-full md:p-2 text-sm md:text-base bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 col-span-1 md:col-span-2"
        >
          {isLoading ? 'Searching...' : 'Search Jobs'}
        </button>
      </div>
    </form>
  );
}

export default Filters;
