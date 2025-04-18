import { searchITJobs } from './sources/itjobs';
import { searchAdzuna } from './sources/adzuna';
import { searchJooble } from './sources/jooble';

export async function searchJobs() {
  try {
    console.log('Fetching jobs from all sources...');
    
    const results = await Promise.allSettled([
      searchITJobs(),
      searchAdzuna(),
      searchJooble()
    ]);

    const [itJobs, adzunaJobs, joobleJobs] = results.map(result => 
      result.status === 'fulfilled' ? result.value : []
    );

    console.log({
      itJobsCount: itJobs.length,
      adzunaJobsCount: adzunaJobs.length,
      joobleJobsCount: joobleJobs.length
    });

    return [...itJobs, ...adzunaJobs, ...joobleJobs];
  } catch (error) {
    console.error('Search failed:', error.message);
    return [];
  }
}
