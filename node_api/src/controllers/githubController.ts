import express, { NextFunction, Request, Response } from "express";
import GithubRelease from "@/model/github/GithubRelease";
import setGithubConfig from "@/logic/setGithubConfig";
import { CONFIG } from "@im-library/vocabulary";
import getGithubConfig from "@/logic/getGithubConfig";
import AuthMiddleware from "@/middlewares/auth.middleware";

export default class GithubController {
  public path = "/";
  public router = express.Router();
  private auth;

  constructor() {
    this.auth = new AuthMiddleware();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/node_api/github/public/latestRelease", (req, res, next) => this.getLatestRelease(req, res, next));
    this.router.get("/node_api/github/public/releases", (req, res, next) => this.getReleases(req, res, next));
    this.router.get("/node_api/github/updateGithubConfig", this.auth.secure("IMAdmin"), (req, res, next) => this.updateGithubConfigs(req, res, next));
  }

  private async getLatestRelease(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = req.query.repositoryName;
      if (typeof repo !== "string") throw new Error("Missing parameter 'repositoryName' or parameter is not of type 'string'");
      let result;
      if (repo === "IMDirectory") {
        result = await getGithubConfig(CONFIG.IMDIRECTORY_LATEST_RELEASE);
      }
      if (repo === "ImportData") {
        result = await getGithubConfig(CONFIG.IMPORT_DATA_LATEST_RELEASE);
      }
      res.send(result);
    } catch (e) {
      await setGithubConfig();
      await this.getLatestRelease(req, res, next);
    }
  }

  private async getReleases(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = req.query.repositoryName;
      if (typeof repo !== "string") throw new Error("Missing parameter 'repositoryName' or parameter is not of type 'string'");
      let results: GithubRelease[] = [];
      if (repo === "IMDirectory") {
        results = await getGithubConfig(CONFIG.IMDIRECTORY_ALL_RELEASES);
      }
      if (repo === "ImportData") {
        results = await getGithubConfig(CONFIG.IMPORT_DATA_ALL_RELEASES);
      }
      res.send(results);
    } catch (e) {
      await setGithubConfig();
      await this.getReleases(req, res, next);
    }
  }

  private async updateGithubConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      await setGithubConfig();
      res.end();
    } catch (e) {
      console.error(e);
      next(e);
    }
  }
}
