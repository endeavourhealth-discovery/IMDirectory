import { REPO } from "@endeavour/vue-library/enums";
import type { GithubRelease } from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/github";

const GithubService = {
  async getLatestRelease(repositoryName: REPO): Promise<GithubRelease> {
    return await api.get(API_URL + "/public/githubLatest", { params: { repositoryName: repositoryName } });
  },

  async getReleases(repositoryName: REPO): Promise<GithubRelease[]> {
    return await api.get(API_URL + "/public/githubAllReleases", { params: { repositoryName: repositoryName } });
  },

  async updateGithubConfig(repositoryName: REPO): Promise<void> {
    return await api.post(API_URL + "/private/updateGithubConfig", { repo: repositoryName }, { raw: true });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(GithubService);

export default GithubService;
