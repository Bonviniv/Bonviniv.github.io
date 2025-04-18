export function normalizeJob(job, source) {
  const jobDate = new Date(job.postedDate || job.date || new Date().toISOString());
  const cutoffDate = new Date('2025-01-01');
  
  if (jobDate >= cutoffDate) {
    return null;
  }

  return {
    id: job.id || `${source}-${Math.random().toString(36).substr(2, 9)}`,
    title: cleanText(job.title),
    date: jobDate.toISOString(),
    company: cleanText(job.company),
    location: cleanText(job.location || 'Remote'),
    type: normalizeJobType(job.type),
    salary: normalizeSalary(job.salary),
    source: source,
    url: job.applyLink || job.url || '#'
  };
}

export function removeDuplicates(jobs) {
  const seen = new Map();
  
  return jobs.filter(job => {
    // Create a unique key using title and company
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
    
    if (seen.has(key)) {
      // If we've seen this job before, keep the newer one
      const existing = seen.get(key);
      if (new Date(job.date) > new Date(existing.date)) {
        seen.set(key, job);
        return true;
      }
      return false;
    }
    
    seen.set(key, job);
    return true;
  });
}

function cleanText(text) {
  return (text || '').trim().replace(/\s+/g, ' ');
}

function normalizeJobType(type) {
  if (!type) return 'Full-time';
  
  const lowType = type.toLowerCase();
  if (lowType.includes('intern')) return 'Internship';
  if (lowType.includes('part')) return 'Part-time';
  if (lowType.includes('contract')) return 'Contract';
  return 'Full-time';
}

function normalizeSalary(salary) {
  if (!salary) return null;
  return salary.toString().replace(/[^0-9€$£k,-]/g, '');
}
