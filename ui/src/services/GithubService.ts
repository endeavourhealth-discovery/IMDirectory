import Env from "./Env";
import axios from "axios";
import { GithubRelease } from "@im-library/interfaces";

const api = Env.API;

const GithubService = {
  async getLatestRelease(repositoryName: string): Promise<GithubRelease> {
    return axios.get(api + "api/github/public/githubLatest", { params: { repositoryName: repositoryName } });
  },

  async getReleases(repositoryName: string): Promise<GithubRelease[]> {
    return axios.get(api + "api/github/public/githubAllReleases", { params: { repositoryName: repositoryName } });
  },

  async updateGithubConfig(): Promise<void> {
    return axios.get(api + "api/github/updateGithubConfig", { raw: true });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(GithubService);

export default GithubService;
