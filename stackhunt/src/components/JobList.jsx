function JobList({ jobs, displaySettings, preferredCompanies, sortBy, sortOrder, filters }) {
  const parseSalary = (salaryString) => {
    if (!salaryString) return 0;
    const numbers = salaryString.match(/\d+/g);
    return numbers ? Math.max(...numbers.map(Number)) : 0;
  };

  const getExperienceLevel = (level) => {
    const levels = {
      'Internship': 0,
      'Junior': 1,
      'Mid': 2,
      'Senior': 3,
      'Lead': 4
    };
    return levels[level] || 2; // Default to Mid level if not specified
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Date not specified';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const sortJobs = (jobsToSort) => {
    let sorted = [...jobsToSort];

    // Apply keyword filter
    if (filters?.keywords?.trim()) {
      const searchTerms = filters.keywords.toLowerCase().trim().split(/\s+/);
      sorted = sorted.filter(job => {
        const searchableText = [
          job.title,
          job.company,
          job.description,
          job.type,
          ...(job.technology_stack || []),
          job.experience_level
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Apply location filter
    if (filters?.location?.trim()) {
      const searchLocation = filters.location.trim().toLowerCase();
      sorted = sorted.filter(job => 
        job.location?.toLowerCase().includes(searchLocation)
      );
    }

    // Filter by source first
    if (filters?.selectedSource && filters.selectedSource !== 'All Sources') {
      sorted = sorted.filter(job => {
        const jobSource = job.source || '';
        // Remove '(Mock)' from comparison if present
        const cleanJobSource = jobSource.replace(' (Mock)', '');
        const cleanSelectedSource = filters.selectedSource.replace(' (Mock)', '');
        return cleanJobSource === cleanSelectedSource;
      });
    }

    // First prioritize preferred companies
    if (preferredCompanies.length > 0) {
      sorted.sort((a, b) => {
        const aIsPreferred = preferredCompanies.some(company => 
          a.company.toLowerCase().includes(company.toLowerCase())
        );
        const bIsPreferred = preferredCompanies.some(company => 
          b.company.toLowerCase().includes(company.toLowerCase())
        );
        
        if (aIsPreferred && !bIsPreferred) return -1;
        if (!aIsPreferred && bIsPreferred) return 1;
        return 0;
      });
    }

    // Then apply secondary sorting
    if (sortBy) {
      sorted.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'salary':
            comparison = parseSalary(b.salary) - parseSalary(a.salary);
            break;
          case 'date':
            comparison = new Date(b.postedDate || 0) - new Date(a.postedDate || 0);
            break;
          case 'experienceLevel':
            comparison = getExperienceLevel(b.experience_level) - getExperienceLevel(a.experience_level);
            break;
          case 'company':
            comparison = a.company.localeCompare(b.company);
            break;
          case 'source':
            comparison = a.source.localeCompare(b.source);
            break;
          default:
            return 0;
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return sorted;
  };

  const sortedJobs = sortJobs(jobs);

  if (!sortedJobs.length) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-500">
        No jobs found. Try adjusting your search filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {sortedJobs.map(job => (
        <div key={job.id} className="bg-gray-800 dark:bg-dark-secondary rounded-lg shadow-xl p-6">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-white">{job.title}</h3>
              <span className="text-sm text-gray-400 ml-2 whitespace-nowrap">
                {formatDate(job.postedDate || job.date)}
              </span>
            </div>
            
            <div className="text-gray-300 font-medium">{job.company}</div>
            
            {displaySettings.showLocation && (
              <p className="text-gray-400"><span className="text-gray-500">Location:</span> {job.location}</p>
            )}
            {displaySettings.showType && (
              <p className="text-gray-400"><span className="text-gray-500">Type:</span> {job.type}</p>
            )}
            {displaySettings.showSalary && job.salary && (
              <p className="text-gray-400"><span className="text-gray-500">Salary:</span> {job.salary}</p>
            )}
            {displaySettings.showExperienceLevel && job.experience_level && (
              <p className="text-gray-400"><span className="text-gray-500">Level:</span> {job.experience_level}</p>
            )}
            <p className="text-gray-400"><span className="text-gray-500">Posted:</span> {formatDate(job.postedDate)}</p>
          </div>

          {displaySettings.showTechnologies && job.technology_stack && (
            <div className="mb-4">
              <p className="text-gray-500 mb-2">Technologies:</p>
              <div className="flex flex-wrap gap-2">
                {job.technology_stack.map((tech, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            {displaySettings.showSource && (
              <span className="text-sm text-gray-400">
                {job.source}
              </span>
            )}
            <a
              href={job.applyLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block px-4 py-2 rounded transition-colors ${
                job.applyLink 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
              onClick={e => !job.applyLink && e.preventDefault()}
            >
              Apply Now
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default JobList;
