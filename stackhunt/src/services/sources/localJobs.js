import vagasInternacional from '../../data/vagas_filtradas_internacional.json';
import vagasPortugal from '../../data/vagas_filtradas.json';

export async function searchLocalJobs() {
  try {
    const normalizeJob = (job, source) => ({
      id: `sapo-${Math.random().toString(36).substr(2, 9)}`,
      title: job.titulo,
      company: job.empresa,
      location: job.local,
      type: job.tipo || 'Full-time',
      salary: null,
      postedDate: new Date().toISOString(),
      applyLink: job.url,
      description: job.descricao,
      source: source
    });

    const internationalJobs = vagasInternacional.map(job => 
      normalizeJob(job, 'SapoEmpregos')
    );

    const portugalJobs = vagasPortugal.map(job => 
      normalizeJob(job, 'SapoEmpregosPT')
    );

    return [...internationalJobs, ...portugalJobs];
  } catch (error) {
    console.error('Local Jobs Error:', error);
    return [];
  }
}
