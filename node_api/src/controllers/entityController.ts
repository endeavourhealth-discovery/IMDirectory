import { ContextMap } from "@im-library/interfaces";
import EntityService from "@/services/entity.service";
import axios from "axios";
import { Request } from "express";
import router from "express-promise-router";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";

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
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/propertiesDisplay", (req, res, next) =>
      this.getPropertiesDisplay(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/detailsDisplay/loadMore", (req, res, next) =>
      this.loadMoreDetailsTab(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/setDiff", (req, res, next) =>
      this.getSetDiff(req)
        .then(data => res.send(data))
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

  async getSetDiff(req: Request) {
    const setIriA = req.query.setIriA as string;
    const setIriB = req.query.setIriB as string;
    if (!setIriA && !setIriB) throw new CustomError("At least one of setIriA and setIriB parameters needs to be populated.", ErrorType.InvalidInputError);
    return await this.entityService.getSetDiff(setIriA, setIriB);
  }
}
