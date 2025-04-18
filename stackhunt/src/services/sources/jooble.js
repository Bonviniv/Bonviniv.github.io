import axios from 'axios';

const JOOBLE_API_KEY = 'e62fb7b8-e2b7-4a33-b4ba-c9ab8a58ad63';
const JOOBLE_URL = 'https://jooble.org/api';

export async function searchJooble() {
  try {
    const response = await axios({
      method: 'POST',
      url: `${JOOBLE_URL}/${JOOBLE_API_KEY}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: {
        keywords: "developer",
        location: "Portugal",
        page: 1,
        searchMode: 1
      }
    });

    console.log('Jooble API Response:', response.data);

    if (!response.data?.jobs) {
      console.warn('No jobs found in Jooble response');
      return [];
    }

    const normalizedJobs = response.data.jobs.map(job => ({
      id: `jooble-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: job.title,
      company: job.company || 'Unknown',
      location: job.location || 'Unknown',
      type: job.type || 'Unknown',
      salary: job.salary || null,
      postedDate: job.updated || new Date().toISOString(),
      applyLink: job.link,
      description: job.snippet || '',
      source: 'Jooble'
    }));

    console.log(`Normalized ${normalizedJobs.length} Jooble jobs`);
    return normalizedJobs;
  } catch (error) {
    console.error('Jooble API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return [];
  }
}
