import Env from "./Env";
import axios from "axios";
import { GithubRelease } from "@im-library/interfaces";

const api = Env.VITE_NODE_API;

const GithubService = {
  async getLatestRelease(repositoryName: string): Promise<GithubRelease> {
    return axios.get(api + "node_api/github/public/latestRelease/", { params: { repositoryName: repositoryName } });
  },

  async getReleases(repositoryName: string): Promise<GithubRelease[]> {
    return axios.get(api + "node_api/github/public/releases", { params: { repositoryName: repositoryName } });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(GithubService);

export default GithubService;
