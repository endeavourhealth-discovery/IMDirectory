import Env from "./Env";
import axios from "axios";
import { GithubRelease } from "@im-library/interfaces";

const api = Env.VITE_NODE_API;

const GithubService = {
  async getLatestRelease(repositoryName: string) {
    try {
      return await axios.get(api + "node_api/github/public/latestRelease/", { params: { repositoryName: repositoryName } });
    } catch (error) {
      console.warn(error);
      return {} as any;
    }
  },

  async getReleases(repositoryName: string): Promise<GithubRelease[]> {
    try {
      return await axios.get(api + "node_api/github/public/releases", { params: { repositoryName: repositoryName } });
    } catch (error) {
      console.warn(Error);
      return [];
    }
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(GithubService);

export default GithubService;
