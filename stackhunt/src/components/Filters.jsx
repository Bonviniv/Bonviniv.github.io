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
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        <input
          type="text"
          placeholder="Keywords (e.g. JavaScript, React)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white md:col-span-3"
        />
        <input
          type="text"
          placeholder="Location (e.g. Lisbon, Remote)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white md:col-span-3"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 md:col-span-2"
        >
          {isLoading ? 'Searching...' : 'Search Jobs'}
        </button>
      </div>
    </form>
  );
}

export default Filters;
