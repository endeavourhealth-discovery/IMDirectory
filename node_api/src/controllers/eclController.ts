import EclService from "@/services/ecl.service";
import Env from "@/services/env.service";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import axios from "axios";
import express, { NextFunction, Request, Response } from "express";

export default class EclController {
  public path = "/node_api/ecl";
  public router = express.Router();
  private eclService;

  constructor() {
    this.initRoutes();
    this.eclService = new EclService(axios);
  }

  private initRoutes() {
    this.router.post("/public/eclToBuilder", (req, res, next) => this.eclToBuild(req, res, next));
    this.router.post("/public/eclToIMQ", (req, res, next) => this.eclToIMQ(req, res, next));
    this.router.post("/public/eclSearch", (req, res, next) => this.eclSearch(req, res, next));
    this.router.post("/public/validateEcl", (req, res, next) => this.validateEcl(req, res, next));
  }

  async eclToBuild(req: Request, res: Response, next: NextFunction) {
    const ecl = req.body;
    try {
      const result = this.eclService.eclToBuild(ecl);
      res.send(result).end();
    } catch (error: any) {
      next(error);
    }
  }

  async eclToIMQ(req: Request, res: Response, next: NextFunction) {
    const ecl = req.body;
    try {
      const result = this.eclService.eclToIMQ(ecl);
      res.send(result).end();
    } catch (error: any) {
      next(error);
    }
  }

  async eclSearch(req: Request, res: Response, next: NextFunction) {
    const eclSearchRequest = req.body;
    try {
      const result = await this.eclService.eclSearch(eclSearchRequest);
      res.send(result).end();
    } catch (error: any) {
      next(error);
    }
  }

  async validateEcl(req: Request, res: Response, next: NextFunction) {
    const result = this.eclService.validateEcl(req.body);
    res.send(result).end();
  }
}
