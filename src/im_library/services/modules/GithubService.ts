import Env from "./Env";
import axios from "axios";
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

  async getReleases(repositoryName: string) {
    try {
      return await axios.get(api + "node_api/github/public/releases", { params: { repositoryName: repositoryName } });
    } catch (error) {
      console.warn(Error);
      return [];
    }
  }
};

Object.freeze(GithubService);

export default GithubService;
