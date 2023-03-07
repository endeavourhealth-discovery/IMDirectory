import EntityService from "@/services/entity.service";
import axios from "axios";
import express, { NextFunction, Request, Response } from "express";

export default class EntityController {
  public path = "/node_api/entity";
  public router = express.Router();
  private entityService;
  constructor() {
    this.entityService = new EntityService(axios);
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/public/detailsDisplay", (req, res, next) => this.getDetailsDisplay(req, res, next));
    this.router.get("/public/propertiesDisplay", (req, res, next) => this.getPropertiesDisplay(req, res, next));
    this.router.get("/public/detailsDisplay/loadMore", (req, res, next) => this.loadMoreDetailsTab(req, res, next));
    this.router.get("/public/propertyType", (req, res, next) => this.getPropertyType(req, res, next));
  }

  async getPropertiesDisplay(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.entityService.getPropertiesDisplay(req.query.iri as string);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }
  async getPropertyType(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.entityService.getPropertyType(req.query.url as string);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }


  async getDetailsDisplay(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.entityService.getDetailsDisplay(req.query.iri as string);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }

  async loadMoreDetailsTab(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.entityService.loadMoreDetailsDisplay(
        req.query.iri as string,
        req.query.predicate as string,
        req.query.pageIndex as string,
        req.query.pageSize as string
      );
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }
}
