import axios from 'axios';

const IT_JOBS_API_KEY = 'eb5ed72476bd230f309fb0080c019137';
const IT_JOBS_BASE_URL = 'https://api.itjobs.pt/job/search.json';

export async function searchITJobs() {
    try {
        const response = await axios.get(IT_JOBS_BASE_URL, {
            params: {
                api_key: IT_JOBS_API_KEY,
                limit: 100
            }
        });

        return response.data.results?.map(job => ({
            id: `itjobs-${job.id}`,
            title: job.title,
            company: job.company?.name || 'Unknown Company',
            location: job.location || 'Unknown',
            type: job.type || 'Unknown',
            salary: job.salary?.min && job.salary?.max 
                ? `€${job.salary.min} - €${job.salary.max}`
                : null,
            postedDate: job.published_at || new Date().toISOString(),
            applyLink: job.url,
            description: job.description || '',
            experience_level: job.seniority || '',
            technology_stack: job.technologies || [],
            source: 'ITJobs'
        })) || [];
    } catch (error) {
        console.error('ITJobs API Error:', error.message);
        return [];
    }
}