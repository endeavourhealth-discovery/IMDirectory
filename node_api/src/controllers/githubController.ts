import express, { NextFunction, Request, Response } from "express";
import { Octokit } from "@octokit/core";
import GithubRelease from "@/model/github/GithubRelease";
import Env from "@/services/env.service";

export default class GithubController {
  public path = "/";
  public router = express.Router();
  private octokit;
  private owner = "endeavourhealth-discovery";

  constructor() {
    this.initRoutes();
    this.octokit = new Octokit({ auth: Env.GIT_TOKEN });
  }

  private initRoutes() {
    this.router.get("/node_api/github/public/latestRelease", (req, res, next) => this.getLatestRelease(req, res, next));
    this.router.get("/node_api/github/public/releases", (req, res, next) => this.getReleases(req, res, next));
  }

  private async getLatestRelease(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = req.query.repositoryName;
      if (typeof repo !== "string") throw new Error("Missing parameter 'repositoryName' or parameter is not of type 'string'");
      const result = await this.octokit.request("GET /repos/{owner}/{repo}/releases/latest", { owner: this.owner, repo: repo, type: "private" });
      const processedResult = this.processRelease(result.data);
      res.send(processedResult);
    } catch (e) {
      console.error(e);
      next(e);
    }
  }

  private async getReleases(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = req.query.repositoryName;
      if (typeof repo !== "string") throw new Error("Missing parameter 'repositoryName' or parameter is not of type 'string'");
      const results = await this.octokit.request("GET /repos/{owner}/{repo}/releases", { owner: this.owner, repo: repo, type: "private" });
      const processedResults: GithubRelease[] = [];
      results.data.forEach((result: any) => processedResults.push(this.processRelease(result)));
      res.send(processedResults);
    } catch (e) {
      console.error(e);
      next(e);
    }
  }

  private processRelease(release: any): GithubRelease {
    return new GithubRelease(release.tag_name, release.name, release.created_at, release.published_at, release.body, release.author.login, release.html_url);
  }
}
