import GithubService from "@/services/github.service";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { CONFIG } from "@im-library/vocabulary";
import _ from "lodash-es";
import logger from "@/middlewares/logger.middleware";
import axios from "axios";
import Env from "@/services/env.service";

const githubService = new GithubService();

async function setGithubConfig() {
  await setLatestRelease("IMDirectory", CONFIG.IMDIRECTORY_LATEST_RELEASE);
  await setAllReleases("IMDirectory", CONFIG.IMDIRECTORY_ALL_RELEASES);
}

async function setLatestRelease(repoName: string, configName: string) {
  let currentReleaseConfig;
  try {
    currentReleaseConfig = (await axios.get(Env.API + "api/config/public/githubLatest")).data;
  } catch (err) {
    logger.warn(`missing config item ${configName}`);
  }
  let latestRelease;
  try {
    latestRelease = await githubService.getLatestRelease(repoName);
  } catch (error) {
    throw new Error(`Failed to fetch latest release from github for repo ${repoName}`);
  }

  if (!latestRelease || !latestRelease.version) throw new Error(`Failed to fetch latest ${repoName} release`);
  else if (currentReleaseConfig && latestRelease) {
    if (!_.isEqual(currentReleaseConfig, latestRelease)) {
      await axios.post(Env.API + "api/config/public/githubLatest", latestRelease);
    }
  } else if (!currentReleaseConfig && latestRelease) {
    await axios.post(Env.API + "api/config/public/githubLatest", latestRelease);
  }
}

async function setAllReleases(repoName: string, configName: string) {
  let currentReleasesConfig;
  try {
    currentReleasesConfig = (await axios.get(Env.API + "api/config/public/githubAllReleases")).data;
  } catch (err) {
    logger.warn(`missing config item ${configName}`);
  }

  let latestReleases;
  try {
    latestReleases = await githubService.getReleases(repoName);
  } catch (err) {
    throw new Error(`Failed to fetch all releases from github for repo ${repoName}`);
  }
  if (!latestReleases || !isArrayHasLength(latestReleases)) throw new Error(`Failed to fetch all ${repoName} releases`);
  else if (currentReleasesConfig && latestReleases) {
    if (!_.isEqual(currentReleasesConfig, latestReleases)) {
      await axios.post(Env.API + "api/config/public/githubAllReleases", latestReleases);
    }
  } else if (!currentReleasesConfig && latestReleases) {
    await axios.post(Env.API + "api/config/public/githubAllReleases", latestReleases);
  }
}

export default setGithubConfig;
