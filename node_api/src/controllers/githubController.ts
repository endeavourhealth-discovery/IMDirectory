import { NextFunction, Request, Response } from "express";
import { GithubRelease } from "@im-library/interfaces/AutoGen";
import setGithubConfig from "@/logic/setGithubConfig";
import { CONFIG } from "@im-library/vocabulary";
import getGithubConfig, { getGithubLatest, getGithubReleases } from "@/logic/getGithubConfig";
import AuthMiddleware from "@/middlewares/auth.middleware";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";
import router from "express-promise-router";

export default class GithubController {
  public path = "/";
  public router = router();
  private auth;

  constructor() {
    this.auth = new AuthMiddleware();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/node_api/github/public/latestRelease", (req, res, next) =>
      this.getLatestRelease(req, res, next)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/node_api/github/public/releases", (req, res, next) =>
      this.getReleases(req, res, next)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/node_api/github/updateGithubConfig", this.auth.secure("IMAdmin"), (req, res, next) =>
      this.updateGithubConfigs()
        .then(() => res.end())
        .catch(next)
    );
  }

  private async getLatestRelease(req: Request, res: Response, next: NextFunction, attempt?: number): Promise<GithubRelease> {
    if (attempt && attempt > 1) throw new Error("Maximum retries reached. Failed to get latest release and set releases");
    try {
      return await getGithubLatest();
    } catch (e) {
      if (e instanceof CustomError && (e.errorType === ErrorType.ConfigNotFoundError || e.errorType === ErrorType.InvalidJsonError)) {
        await setGithubConfig();
        return await this.getLatestRelease(req, res, next, attempt ? attempt + 1 : 1);
      } else {
        throw e;
      }
    }
  }

  private async getReleases(req: Request, res: Response, next: NextFunction, attempt?: number): Promise<GithubRelease[]> {
    if (attempt && attempt > 1) throw new Error("Maximum retries reached. Failed to get all releases and set releases");
    try {
      return await getGithubReleases();
    } catch (e) {
      if (e instanceof CustomError && (e.errorType === ErrorType.ConfigNotFoundError || e.errorType === ErrorType.InvalidJsonError)) {
        await setGithubConfig();
        return await this.getReleases(req, res, next, attempt ? attempt + 1 : 1);
      } else throw e;
    }
  }

  private async updateGithubConfigs() {
    await setGithubConfig();
  }
}
