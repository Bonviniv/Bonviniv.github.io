import { useState, useEffect } from 'react';

function Sidebar({ onPreferredCompaniesChange }) {
  const [newCompany, setNewCompany] = useState('');
  const [preferredCompanies, setPreferredCompanies] = useState(() => {
    // Load saved companies from localStorage on initial render
    const saved = localStorage.getItem('preferredCompanies');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Save to localStorage whenever preferredCompanies changes
    localStorage.setItem('preferredCompanies', JSON.stringify(preferredCompanies));
    onPreferredCompaniesChange(preferredCompanies);
  }, [preferredCompanies, onPreferredCompaniesChange]);

  const addCompany = (e) => {
    e.preventDefault();
    if (newCompany.trim()) {
      setPreferredCompanies([...preferredCompanies, newCompany.trim()]);
      setNewCompany('');
    }
  };

  const removeCompany = (index) => {
    setPreferredCompanies(preferredCompanies.filter((_, i) => i !== index));
  };

  return (
    <div className="w-64 border-l border-gray-700 p-4 min-h-screen fixed right-0 top-0 pt-32 bg-gray-800 dark:bg-dark-secondary">
      <h3 className="text-white font-semibold mb-4">Preferred Companies</h3>
      <form onSubmit={addCompany} className="mb-4">
        <input
          type="text"
          value={newCompany}
          onChange={(e) => setNewCompany(e.target.value)}
          placeholder="Add company name"
          className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
        />
        <button
          type="submit"
          className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Company
        </button>
      </form>
      <div className="space-y-2">
        {preferredCompanies.map((company, index) => (
          <div key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded">
            <span className="text-gray-300">{company}</span>
            <button
              onClick={() => removeCompany(index)}
              className="text-red-400 hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
