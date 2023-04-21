import GithubRelease from "@/model/github/GithubRelease";
import { Octokit } from "@octokit/core";
import Env from "./env.service";

export default class GithubService {
  public octokit;
  private owner = "endeavourhealth-discovery";

  constructor() {
    this.octokit = new Octokit({ auth: Env.GIT_TOKEN });
  }

  public async getLatestRelease(repo: string) {
    const result = await this.octokit.request("GET /repos/{owner}/{repo}/releases/latest", { owner: this.owner, repo: repo, type: "private" });
    return this.processRelease(result.data);
  }

  public async getReleases(repo: string) {
    const results = await this.octokit.request("GET /repos/{owner}/{repo}/releases", { owner: this.owner, repo: repo, type: "private" });
    const processedResults: GithubRelease[] = [];
    results.data.forEach((result: any) => processedResults.push(this.processRelease(result)));
    return processedResults;
  }

  private processRelease(release: any) {
    return new GithubRelease(release.tag_name, release.name, release.created_at, release.published_at, release.body, release.author.login, release.html_url);
  }
}
