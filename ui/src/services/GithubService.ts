import Env from "./Env";
import axios from "axios";
import { GithubRelease } from "@im-library/interfaces";

const api = Env.API;

const GithubService = {
  async getLatestRelease(repositoryName: string): Promise<GithubRelease> {
    return axios.get(api + "api/config/public/githubLatest", { params: { repositoryName: repositoryName } });
  },

  async getReleases(repositoryName: string): Promise<GithubRelease[]> {
    return axios.get(api + "api/config/public/githubAllReleases", { params: { repositoryName: repositoryName } });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(GithubService);

export default GithubService;
