import express, { NextFunction, Request, Response } from "express";
import axios from "axios";
import SearchService from "@/services/search.service";
import router from "express-promise-router";

export default class SearchController {
  public path = "/";
  public router = router();
  private searchService: SearchService;

  constructor() {
    this.initRoutes();
    this.searchService = new SearchService(axios);
  }

  private initRoutes() {
    this.router.post("/api/entity/public/search", (req, res, next) =>
      this.advancedSearch(req, res)
        .then(data => res.setHeader("Content-Type", "application/json").send(data))
        .catch(next)
    );
    this.router.post("/node_api/public/search/entity", (req, res, next) =>
      this.getEntitiesBySnomedCodes(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.post("/node_api/public/search/validatedEntity", (req, res, next) =>
      this.getValidatedEntitiesBySnomedCodes(req)
        .then(data => res.send(data))
        .catch(next)
    );
  }

  async advancedSearch(req: Request, res: Response) {
    const searchRequest = req.body;
    let result = [];

    if (searchRequest?.termFilter) {
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
    return result;
  }

  async getEntitiesBySnomedCodes(req: Request) {
    const codes = req.body;
    return await this.searchService.findEntitiesBySnomedCodes(codes);
  }

  async getValidatedEntitiesBySnomedCodes(req: Request) {
    const codes = req.body;
    return await this.searchService.findValidatedEntitiesBySnomedCodes(codes);
  }
}
