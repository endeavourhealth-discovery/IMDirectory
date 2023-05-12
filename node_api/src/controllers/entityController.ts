import EntityService from "@/services/entity.service";
import axios from "axios";
import express, { NextFunction, Request, Response } from "express";
import router from "express-promise-router";

export default class EntityController {
  public path = "/node_api/entity";
  public router = router();
  private entityService;
  constructor() {
    this.entityService = new EntityService(axios);
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/public/detailsDisplay", (req, res, next) =>
      this.getDetailsDisplay(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/propertiesDisplay", (req, res, next) =>
      this.getPropertiesDisplay(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/detailsDisplay/loadMore", (req, res, next) =>
      this.loadMoreDetailsTab(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.post("/public/isValidPropertyBoolFocus", (req, res, next) =>
      this.isValidPropertyBoolFocus(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.post("/public/superiorPropertiesBoolFocusPaged", (req, res, next) =>
      this.getSuperiorPropertiesBoolFocusPaged(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/conceptContextMaps", (req, res, next) =>
      this.getConceptContextMaps(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
  }

  async getPropertiesDisplay(req: Request) {
    return await this.entityService.getPropertiesDisplay(req.query.iri as string);
  }

  async getDetailsDisplay(req: Request) {
    return await this.entityService.getDetailsDisplay(req.query.iri as string);
  }

  async loadMoreDetailsTab(req: Request) {
    return await this.entityService.loadMoreDetailsDisplay(
      req.query.iri as string,
      req.query.predicate as string,
      req.query.pageIndex as string,
      req.query.pageSize as string
    );
  }

  async isValidPropertyBoolFocus(req: Request) {
    return await this.entityService.isValidPropertyBoolFocus(req.body.focus, req.body.propertyIri);
  }

  async getSuperiorPropertiesBoolFocusPaged(req: Request) {
    const focus = req.body.focus;
    const pageIndex = req.body.pageIndex;
    const pageSize = req.body.pageSize;
    const filters = req.body.filters;
    return await this.entityService.getSuperiorPropertiesBoolFocusPaged(focus, pageIndex, pageSize, filters);
  }

  async getConceptContextMaps(req: Request) {
    return await this.entityService.getConceptContextMaps(req.query.iri as string);
  }
}
