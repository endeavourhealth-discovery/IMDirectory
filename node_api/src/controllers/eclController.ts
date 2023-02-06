import { eclToBuild, eclToIMQ, validateEcl } from "@/logic/eclLogic";
import Env from "@/services/env.service";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import axios from "axios";
import express, { NextFunction, Request, Response } from "express";

export default class EclController {
  public path = "/node_api/ecl";
  public router = express.Router();

  constructor() {
    this.initRoutes();
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
      const result = eclToBuild(ecl);
      res.send(result).end();
    } catch (err) {
      next(err);
    }
  }

  async eclToIMQ(req: Request, res: Response, next: NextFunction) {
    const ecl = req.body;
    try {
      const result = eclToIMQ(ecl);
      res.send(result).end();
    } catch (error) {
      next(error);
    }
  }

  async eclSearch(req: Request, res: Response, next: NextFunction) {
    const eclSearchRequest = req.body;
    try {
      if (typeof eclSearchRequest.ecl === "string") {
        eclSearchRequest.eclQuery = eclToIMQ(eclSearchRequest.ecl);
        delete eclSearchRequest.ecl;
      } else if (isObjectHasKeys(eclSearchRequest.ecl)) {
        eclSearchRequest.eclQuery = eclSearchRequest.ecl;
        delete eclSearchRequest.ecl;
      }
      const result = await axios.post(Env.API + "api/ecl/public/evaluateEclQuery", eclSearchRequest);
      res.send(result).end();
    } catch (error) {
      next(error);
    }
  }

  async validateEcl(req: Request, res: Response, next: NextFunction) {
    const result = validateEcl(req.body);
    res.send(result).end;
  }
}
