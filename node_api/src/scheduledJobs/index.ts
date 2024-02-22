import { githubConfigJob } from "./githubConfigScheduler";

export default function initScheduledJobs() {
  githubConfigJob.start();
}

export { initScheduledJobs };
