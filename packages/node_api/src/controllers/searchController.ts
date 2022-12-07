import express, { NextFunction, Request, Response } from "express";
import axios from "axios";
import Env from "@/services/env.service";
import SearchService from "@/services/search.service";
import { IM, RDFS } from "im-library/vocabulary";

export default class SearchController {
  public path = "/";
  public router = express.Router();
  private searchService: SearchService;

  constructor() {
    this.initRoutes();
    this.searchService = new SearchService(axios);
  }

  private initRoutes() {
    this.router.post("/api/entity/public/search", (req, res) => this.advancedSearch(req, res));
    this.router.post("/node_api/public/search/entity", (req, res, next) => this.getEntitiesBySnomedCodes(req, res, next));
    this.router.post("/node_api/public/search/validatedEntity", (req, res, next) => this.getValidatedEntitiesBySnomedCodes(req, res, next));
  }

  async advancedSearch(req: Request, res: Response) {
    const searchRequest = req.body;
    let result = [];

    if (searchRequest != null && searchRequest.termFilter) {
      if (!searchRequest.index) searchRequest.index = "concept";

      if (searchRequest.termFilter.length < 3) {
        const qry = this.searchService.buildCodeKeyQuery(searchRequest);
        result = await this.searchService.getEntities(qry);
      } else if (!searchRequest.termFilter.includes(" ")) {
        const qry = this.searchService.buildSimpleTermCodeMatch(searchRequest);
        result = await this.searchService.getEntities(qry);
      } else {
        let qry = this.searchService.buildSimpleTermMatch(searchRequest);
        result = await this.searchService.getEntities(qry);
        if (result.length === 0) {
          let qry = this.searchService.buildMultiWordMatch(searchRequest);
          result = await this.searchService.getEntities(qry);
        }
      }
    }

    res.setHeader("Content-Type", "application/json").send(result);
    res.end();
  }

  async getEntitiesBySnomedCodes(req: Request, res: Response, next: NextFunction) {
    try {
      const codes = req.body;
      const result = await this.searchService.findEntitiesBySnomedCodes(codes);
      res.send(result).end();
    } catch (error) {
      next(error);
    }
  }

  async getValidatedEntitiesBySnomedCodes(req: Request, res: Response, next: NextFunction) {
    try {
      const codes = req.body;
      const result = await this.searchService.findValidatedEntitiesBySnomedCodes(codes);
      res.send(result).end();
    } catch (error) {
      next(error);
    }
  }
}
