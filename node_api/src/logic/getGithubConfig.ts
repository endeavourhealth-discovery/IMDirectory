import Env from "@/services/env.service";
import { GithubRelease } from "@im-library/interfaces";
import axios from "axios";

export async function getGithubLatest(): Promise<GithubRelease> {
  return (await axios.get(Env.API + "api/config/public/githubLatest")).data;
}

export async function getGithubReleases(): Promise<GithubRelease[]> {
  return (await axios.get(Env.API + "api/config/public/githubAllReleases")).data;
}

export default { getGithubLatest, getGithubReleases };
