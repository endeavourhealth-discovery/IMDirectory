import Env from "./Env";
import axios from "axios";
import { GithubRelease } from "@/interfaces";

const API_URL = Env.API + "api/github";

const GithubService = {
  async getLatestRelease(repositoryName: string): Promise<GithubRelease> {
    return await axios.get(API_URL + "/public/githubLatest", { params: { repositoryName: repositoryName } });
  },

  async getReleases(repositoryName: string): Promise<GithubRelease[]> {
    return await axios.get(API_URL + "/public/githubAllReleases", { params: { repositoryName: repositoryName } });
  },

  async updateGithubConfig(): Promise<void> {
    return await axios.post(API_URL + "/private/updateGithubConfig", { raw: true });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(GithubService);

export default GithubService;
