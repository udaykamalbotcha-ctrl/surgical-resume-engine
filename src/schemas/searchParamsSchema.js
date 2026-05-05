import { z } from 'zod';

export const searchParams = {
  siteNames: z
    .string()
    .describe(
      'Comma-separated list of job sites to search. Options: indeed,linkedin,zip_recruiter,glassdoor,google,bayt,naukri'
    )
    .default('indeed'),
  searchTerm: z
    .string()
    .describe('Search term for jobs')
    .default('software engineer'),
  location: z.string().describe('Location for job search').default('remote'),
  distance: z.number().describe('Distance in miles').default(50),
  jobType: z
    .enum(['fulltime', 'parttime', 'internship', 'contract'])
    .describe('Type of job: fulltime, parttime, internship, contract')
    .optional(),
  googleSearchTerm: z.string().describe('Google specific search term').optional(),
  resultsWanted: z.number().describe('Number of results wanted').default(20),
  easyApply: z
    .boolean()
    .describe('Filter for jobs that are hosted on the job board site')
    .default(false),
  descriptionFormat: z
    .enum(['markdown', 'html'])
    .describe('Format type of the job descriptions')
    .default('markdown'),
  offset: z.number().describe('Starts the search from an offset').default(0),
  hoursOld: z.number().describe('How many hours old the jobs can be').default(72),
  verbose: z
    .number()
    .describe('Controls verbosity (0=errors only, 1=errors+warnings, 2=all logs)')
    .default(2),
  countryIndeed: z.string().describe('Country for Indeed search').default('USA'),
  isRemote: z
    .boolean()
    .describe('Whether to search for remote jobs only')
    .default(false),
  linkedinFetchDescription: z
    .boolean()
    .describe('Whether to fetch LinkedIn job descriptions (slower)')
    .default(true),
  linkedinCompanyIds: z
    .string()
    .describe('Comma-separated list of LinkedIn company IDs')
    .optional(),
  enforceAnnualSalary: z
    .boolean()
    .describe('Converts wages to annual salary')
    .default(false),
  proxies: z.string().describe('Comma-separated list of proxies').optional(),
  caCert: z.string().describe('Path to CA Certificate file for proxies').optional(),
  format: z.enum(['json', 'csv']).describe('Output format').default('json'),
  timeout: z
    .number()
    .describe('Timeout in milliseconds for the job search process')
    .default(120000),
};