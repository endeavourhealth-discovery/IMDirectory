import ConfigRepository from "@/repositories/configRepository";
import GithubService from "@/services/github.service";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { CONFIG } from "@im-library/vocabulary/CONFIG";
import _ from "lodash";

async function setGithubConfig() {
  const configRepository = new ConfigRepository();
  const githubService = new GithubService();
  await setLatestRelease(configRepository, githubService, "IMDirectory", CONFIG.IMDIRECTORY_LATEST_RELEASE);
  await setLatestRelease(configRepository, githubService, "ImportData", CONFIG.IMPORT_DATA_LATEST_RELEASE);
  await setAllReleases(configRepository, githubService, "IMDirectory", CONFIG.IMDIRECTORY_ALL_RELEASES);
  await setAllReleases(configRepository, githubService, "ImportData", CONFIG.IMPORT_DATA_ALL_RELEASES);
}

async function setLatestRelease(configRepository: ConfigRepository, githubService: GithubService, repoName: string, configName: string) {
  let currentReleaseConfig;
  try {
    currentReleaseConfig = JSON.parse(await configRepository.getConfig(configName)).replaceAll("`", "'");
  } catch (err) {
    console.error(`missing config item ${configName}`);
  }
  const latestRelease = await githubService.getLatestRelease(repoName);
  if (!latestRelease || !latestRelease.version) throw new Error(`Failed to fetch latest ${repoName} release`);
  else if (currentReleaseConfig && latestRelease) {
    if (!_.isEqual(currentReleaseConfig, latestRelease)) {
      await configRepository.setConfig(configName, `${repoName} lastest release`, `Latests github release details for ${repoName} repository`, latestRelease);
    }
  } else if (!currentReleaseConfig && latestRelease) {
    await configRepository.setConfig(configName, `${repoName} lastest release`, `Latests github release details for ${repoName} repository`, latestRelease);
  }
}

async function setAllReleases(configRepository: ConfigRepository, githubService: GithubService, repoName: string, configName: string) {
  let currentReleasesConfig;
  try {
    currentReleasesConfig = JSON.parse(await configRepository.getConfig(configName)).replaceAll("`", "'");
  } catch (err) {
    console.error(`missing config item ${configName}`);
  }
  const latestReleases = await githubService.getReleases(repoName);
  if (!latestReleases || !isArrayHasLength(latestReleases)) throw new Error(`Failed to fetch all ${repoName} releases`);
  else if (currentReleasesConfig && latestReleases) {
    if (!_.isEqual(currentReleasesConfig, latestReleases)) {
      await configRepository.setConfig(configName, `${repoName} releases`, `All github release details for ${repoName} repository`, latestReleases);
    }
  } else if (!currentReleasesConfig && latestReleases) {
    await configRepository.setConfig(configName, `${repoName} releases`, `All github release details for ${repoName} repository`, latestReleases);
  }
}

export default setGithubConfig;
