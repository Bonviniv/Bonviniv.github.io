1export function matchesKeywords(job, keywords) {
  if (!keywords) return true;
  const searchTerms = keywords.toLowerCase().split(' ');
  const searchText = `${job.title} ${job.description || ''}`.toLowerCase();
  return searchTerms.every(term => searchText.includes(term));
}

export function extractCompany(title) {
  const atIndex = title.lastIndexOf(' at ');
  return atIndex !== -1 ? title.slice(atIndex + 4) : 'Unknown Company';
}
