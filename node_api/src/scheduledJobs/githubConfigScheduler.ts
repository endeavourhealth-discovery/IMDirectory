import cron from "node-cron";
import setGithubConfig from "../logic/setGithubConfig";
import logger from "@/middlewares/logger.middleware";

const githubConfigJob = cron.schedule(
  "* * 0 * * *",
  async () => {
    logger.info("Running githubConfig task");
    await setGithubConfig();
    logger.info("Updated githubConfig");
  },
  { timezone: "Europe/London" }
);

export { githubConfigJob };
