import EclService from "@/services/ecl.service";
import axios from "axios";
import express, { NextFunction, Request, Response } from "express";

export default class EclController {
  public path = "/node_api/ecl";
  public router = express.Router();
  private eclService = new EclService(axios);

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post("/public/parseEcl", (req, res, next) => this.parseEcl(req, res, next));
  }

  async parseEcl(req: Request, res: Response, next: NextFunction) {
    const ecl = req.body;
    try {
      const result = this.eclService.parseEcl(ecl);
      return result;
    } catch (err) {
      next(err);
    }
  }
}
