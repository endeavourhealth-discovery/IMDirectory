import { parseArray } from "@endeavour/vue-library";
import { REPO } from "@endeavour/vue-library/enums";
import { type GithubRelease, GithubReleaseSchema } from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/github";

const GithubService = {
  async getLatestRelease(repositoryName: REPO): Promise<GithubRelease> {
    const result = await api.get(API_URL + "/public/githubLatest", { params: { repositoryName: repositoryName } });
    return GithubReleaseSchema.parse(result);
  },

  async getReleases(repositoryName: REPO): Promise<GithubRelease[]> {
    const result = await api.get(API_URL + "/public/githubAllReleases", { params: { repositoryName: repositoryName } });
    return parseArray(result, GithubReleaseSchema);
  },

  async updateGithubConfig(repositoryName: REPO): Promise<void> {
    return await api.post(API_URL + "/private/updateGithubConfig", { repo: repositoryName }, { raw: true });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(GithubService);

export default GithubService;
