export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  datePosted: string | null;
  jobUrl?: string;
  description?: string;
  site?: string;
  salary?: string;
  jobType?: string;
}

export interface SearchJobsResult {
  count: number;
  message: string;
  jobs: Job[];
}
