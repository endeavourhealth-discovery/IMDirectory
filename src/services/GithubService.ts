import { REPO } from "vue-library/enums";
import type { GithubRelease } from "vue-library/interfaces";

import axios from "axios";

import Env from "./Env";

const API_URL = Env.API + "api/github";

const GithubService = {
  async getLatestRelease(repositoryName: REPO): Promise<GithubRelease> {
    return await axios.get(API_URL + "/public/githubLatest", { params: { repositoryName: repositoryName } });
  },

  async getReleases(repositoryName: REPO): Promise<GithubRelease[]> {
    return await axios.get(API_URL + "/public/githubAllReleases", { params: { repositoryName: repositoryName } });
  },

  async updateGithubConfig(repositoryName: REPO): Promise<void> {
    return await axios.post(API_URL + "/private/updateGithubConfig", repositoryName, { raw: true });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(GithubService);

export default GithubService;
