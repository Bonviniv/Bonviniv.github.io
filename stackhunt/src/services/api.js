import { searchITJobs } from './sources/itjobs';
import { searchAdzuna } from './sources/adzuna';
import { searchLocalJobs } from './sources/localJobs';

export async function searchJobs() {
  try {
    console.log('Fetching jobs from all sources...');
    
    const results = await Promise.allSettled([
      searchITJobs(),
      searchAdzuna(),
      searchLocalJobs()
    ]);

    const [itJobs, adzunaJobs, localJobs] = results.map(result => 
      result.status === 'fulfilled' ? result.value : []
    );

    console.log({
      itJobsCount: itJobs.length,
      adzunaJobsCount: adzunaJobs.length,
      localJobsCount: localJobs.length
    });

    return [...itJobs, ...adzunaJobs, ...localJobs];
  } catch (error) {
    console.error('Search failed:', error.message);
    return [];
  }
}
