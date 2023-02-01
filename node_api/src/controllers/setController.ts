import { buildQueryFromSetQueryObject, buildSetQueryObjectFromQuery } from "@/builders/query/setQueryBuilder";
import { SetQueryObject } from "@im-library/interfaces";
import { Query } from "@im-library/models/AutoGen";
import axios from "axios";
import express, { NextFunction, Request, Response } from "express";

export default class SetController {
  public path = "/node_api/set";
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post("/public/setQueryObject/query", (req, res, next) => this.getQueryFromSetQueryObject(req, res, next));
    this.router.post("/public/query/setQueryObject", (req, res, next) => this.getSetQueryObjectFromQuery(req, res, next));
  }

  async getSetQueryObjectFromQuery(req: Request, res: Response, next: NextFunction) {
    try {
      const data = buildSetQueryObjectFromQuery(req.body as Query);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }

  async getQueryFromSetQueryObject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = buildQueryFromSetQueryObject(req.body as SetQueryObject[]);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }
}
