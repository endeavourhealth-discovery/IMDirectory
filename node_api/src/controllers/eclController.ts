import { eclToBuild } from "@/logic/eclLogic";
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
}
