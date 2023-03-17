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
    this.router.post("/public/isValidPropertyBoolFocus", (req, res, next) => this.isValidPropertyBoolFocus(req, res, next));
    this.router.post("/public/superiorPropertiesBoolFocusPaged", (req, res, next) => this.getSuperiorPropertiesBoolFocusPaged(req, res, next));
    this.router.get("/public/propertyType", (req, res, next) => this.getPropertyType(req, res, next));
    this.router.get("/public/propertyRange", (req, res, next) => this.getPropertyRange(req, res, next));
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
      const data = await this.entityService.getPropertyType(req.query.modelIri as string, req.query.propIri as string);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }

  async getPropertyRange(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.entityService.getPropertyRange(req.query.propIri as string);
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

  async isValidPropertyBoolFocus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.entityService.isValidPropertyBoolFocus(req.body.focus, req.body.propertyIri);
      res.send(result).end();
    } catch (error) {
      res.send(false).end();
    }
  }

  async getSuperiorPropertiesBoolFocusPaged(req: Request, res: Response, next: NextFunction) {
    try {
      const focus = req.body.focus;
      const pageIndex = req.body.pageIndex;
      const pageSize = req.body.pageSize;
      const filters = req.body.filters;
      const result = await this.entityService.getSuperiorPropertiesBoolFocusPaged(focus, pageIndex, pageSize, filters);
      res.send(result).end();
    } catch (error) {
      res.send({ result: [], totalCount: 0 }).end();
    }
  }
}
