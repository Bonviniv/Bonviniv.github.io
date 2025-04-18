import { useState, useEffect } from 'react';
import { searchJobs } from './services/api';
import Filters from './components/Filters';
import JobList from './components/JobList';
import LoadingSpinner from './components/LoadingSpinner';
import DisplaySettings from './components/DisplaySettings';
import Sidebar from './components/Sidebar';
import SortingSidebar from './components/SortingSidebar';

function App() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displaySettings, setDisplaySettings] = useState({
    showSalary: true,
    showLocation: true,
    showType: true,
    showTechnologies: true,
    showExperienceLevel: true,
    showSource: true
  });
  const [preferredCompanies, setPreferredCompanies] = useState(() => {
    const saved = localStorage.getItem('preferredCompanies');
    return saved ? JSON.parse(saved) : [];
  });
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    localStorage.setItem('preferredCompanies', JSON.stringify(preferredCompanies));
  }, [preferredCompanies]);

  // Remove this useEffect as it's causing the infinite loop
  // useEffect(() => {
  //   if (jobs.length > 0) {
  //     const sortedJobs = [...jobs];
  //     setJobs(sortedJobs);
  //   }
  // }, [preferredCompanies, sortBy, sortOrder]);

  // Update logging useEffect to avoid dependency on jobs array
  useEffect(() => {
    const getSortedJobs = () => {
      let sortedJobs = [...jobs];
      
      if (preferredCompanies.length > 0) {
        sortedJobs.sort((a, b) => {
          const aIsPreferred = preferredCompanies.some(company => 
            a.company.toLowerCase().includes(company.toLowerCase())
          );
          const bIsPreferred = preferredCompanies.some(company => 
            b.company.toLowerCase().includes(company.toLowerCase())
          );
          return bIsPreferred - aIsPreferred;
        });
      }
      return sortedJobs;
    };

    if (jobs.length > 0) {
      const currentJobs = getSortedJobs();
      console.group('Current Job List View - First 10 Offers:');
      currentJobs.slice(0, 10).forEach((job, index) => {
        console.group(`Job #${index + 1} - ${job.title}`);
        console.log({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          salary: job.salary,
          postedDate: job.postedDate,
          description: job.description,
          requirements: job.requirements,
          benefits: job.benefits,
          technologies: job.technology_stack,
          experienceLevel: job.experience_level,
          source: job.source,
          applyLink: job.applyLink,
          isPreferred: preferredCompanies.some(company => 
            job.company.toLowerCase().includes(company.toLowerCase())
          )
        });
        console.groupEnd();
      });
      console.groupEnd();
    }
  }, [preferredCompanies]); // Only re-run when preferred companies change

  const handleSearch = async (filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchJobs();
      setJobs(results);
      setActiveFilters(filters); // Store the filters
    } catch (err) {
      setError('Failed to fetch jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (sortType, sourceFilter) => {
    if (sortType === 'source') {
      setSelectedSource(sourceFilter);
      setSortBy(sortType);
    } else if (sortType === sortBy) {
      setSortOrder(current => current === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(sortType);
      setSortOrder('desc');
    }
  };

  const handlePreferredCompaniesChange = (companies) => {
    setPreferredCompanies(companies);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-primary transition-colors duration-300">
      <header className="bg-white dark:bg-dark-secondary shadow-lg fixed w-full z-10">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">StackHunt</h1>
          <DisplaySettings settings={displaySettings} onSettingsChange={setDisplaySettings} />
        </div>
      </header>
      <div className="pt-20 pl-48 pr-64"> {/* Updated padding-top from pt-16 to pt-32 */}
        <SortingSidebar onSortChange={handleSort} />
        <main className="flex-1 p-6">
          <Filters onSearch={handleSearch} isLoading={isLoading} />
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
          )}
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <JobList 
              jobs={jobs} 
              displaySettings={displaySettings}
              preferredCompanies={preferredCompanies}
              sortBy={sortBy}
              sortOrder={sortOrder}
              filters={activeFilters}  // Pass filters to JobList
              selectedSource={selectedSource}
            />
          )}
        </main>
        <Sidebar 
          onPreferredCompaniesChange={handlePreferredCompaniesChange}
        />
      </div>
    </div>
  );
}

export default App;
