import EntityService from "@/services/entity.service";
import QueryService from "@/services/query.service";
import { Query, QueryRequest } from "@im-library/interfaces/AutoGen";
import axios from "axios";
import { Request } from "express";
import router from "express-promise-router";
import AuthMiddleware from "@/middlewares/auth.middleware";
import { IM, RDFS } from "@im-library/vocabulary";

export default class QueryController {
  public path = "/node_api/query";
  public router = router();
  private queryService: QueryService;
  private entityService: EntityService;
  private auth: AuthMiddleware;

  constructor() {
    this.auth = new AuthMiddleware();
    this.initRoutes();
    this.queryService = new QueryService(axios);
    this.entityService = new EntityService(axios);
  }

  private initRoutes() {
    this.router.get("/public/queryDisplay", (req, res, next) =>
      this.getQueryDisplay(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("/public/queryDisplayFromQuery", (req, res, next) =>
      this.getQueryDisplayFromQuery(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/public/allowablePropertySuggestions", (req, res, next) =>
      this.getAllowablePropertySuggestions(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/allowablePropertySuggestionsBoolFocus", (req, res, next) =>
      this.getAllowablePropertySuggestionsBoolFocus(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/allowableRangeSuggestions", (req, res, next) =>
      this.getAllowableRangeSuggestions(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/allowableChildTypes", (req, res, next) =>
      this.getAllowableChildTypes(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/propertyRange", (req, res, next) =>
      this.getPropertyRange(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/isFunctionProperty", (req, res, next) =>
      this.isFunctionProperty(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("/public/labeledQuery", (req, res, next) =>
      this.getLabeledQuery(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/public/dataModelProperty", (req, res, next) =>
      this.getDataModelProperty(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/public/generateQuerySQL", (req, res, next) =>
      this.generateQuerySQL(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("/public/generateQuerySQL", (req, res, next) =>
      this.generateQuerySQLfromQuery(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("/public/selection/validate", (req, res, next) =>
      this.validateSelectionWithQuery(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/queue", this.auth.secure("IMAdmin"), (req, res, next) =>
      this.queueQuery(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/listQueue", this.auth.secure("IMAdmin"), (req, res, next) =>
      this.listQueries(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/stopQuery", this.auth.secure("IMAdmin"), (req, res, next) =>
      this.stopQuery(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.delete("/queue", this.auth.secure("IMAdmin"), (req, res, next) =>
      this.deleteFromQueue(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/data", this.auth.secure("IMAdmin"), (req, res, next) =>
      this.getResultData(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/graphData", this.auth.secure("IMAdmin"), (req, res, next) =>
      this.getGraphData(req)
        .then(data => res.send(data))
        .catch(next)
    );
  }

  async getAllowableChildTypes(req: Request) {
    return await this.queryService.getAllowableChildTypes(req.query.iri as string);
  }

  async getAllowablePropertySuggestions(req: Request) {
    const iri = req.query.iri;
    const searchTerm = req.query.searchTerm;
    if (iri && typeof iri === "string" && iri.startsWith("http"))
      return await this.queryService.getAllowablePropertySuggestions(iri as string, searchTerm as string);
    else return await this.queryService.searchProperties(searchTerm as string);
  }

  async getAllowablePropertySuggestionsBoolFocus(req: Request) {
    const focus: any = req.body.focus;
    const searchTerm: string = req.body.searchTerm;
    return await this.queryService.getAllowablePropertySuggestionsBoolFocus(focus, searchTerm);
  }

  async getAllowableRangeSuggestions(req: Request) {
    return await this.queryService.getAllowableRangeSuggestions(req.query.iri as string, req.query.searchTerm as string);
  }

  async getPropertyRange(req: Request) {
    return await this.queryService.getPropertyRange(req.query.propIri as string);
  }

  async isFunctionProperty(req: Request) {
    return await this.queryService.isFunctionProperty(req.query.propIri as string);
  }

  async getQueryDisplay(req: Request) {
    return await this.queryService.getQueryDisplay(req.query.queryIri as string);
  }

  async getQueryDisplayFromQuery(req: Request) {
    return await this.queryService.getQueryDisplayFromQuery(req.body as Query);
  }

  async getLabeledQuery(req: Request) {
    const query: any = req.body;
    return await this.queryService.getLabeledQuery(query);
  }

  async getDataModelProperty(req: Request) {
    return await this.queryService.getDataModelProperty(req.query.dataModelIri as string, req.query.propertyIri as string);
  }

  async generateQuerySQL(req: Request): Promise<string> {
    return await this.queryService.generateQuerySQL(req.query.queryIri as string);
  }

  async generateQuerySQLfromQuery(req: Request): Promise<string> {
    const query: any = req.body;
    return await this.queryService.generateQuerySQLFromQuery(query as Query);
  }

  async validateSelectionWithQuery(req: Request) {
    const queryRequest: QueryRequest = req.body.queryRequest;
    const selectedIri: string = req.body.iri;
    return await this.queryService.validateSelectionWithQuery(selectedIri, queryRequest);
  }

  // TODO - CHECK USER RESULT (remove "!")
  async queueQuery(req: Request) {
    const user = await this.auth.getUser(req);
    const iri = req.query.queryIri as string;
    const meta = (await this.entityService.getPartialEntity(iri, [RDFS.LABEL, IM.RETURN_TYPE])).data;

    return await this.queryService.queueQuery(iri, meta[RDFS.LABEL], meta[IM.RETURN_TYPE][0]["@id"], user!);
  }

  async listQueries(req: Request) {
    const user = await this.auth.getUser(req);
    return await this.queryService.listQueries(user!);
  }

  async stopQuery(req: Request) {
    const user = await this.auth.getUser(req);
    return await this.queryService.stopQuery(req.query.queueId as string, user!);
  }

  async deleteFromQueue(req: Request) {
    const user = await this.auth.getUser(req);
    return await this.queryService.deleteFromQueue(req.query.queueId as string, user!);
  }

  async getResultData(req: Request) {
    const user = await this.auth.getUser(req);
    return await this.queryService.getResultData(req.query.queueId as string, user!, +(req.query.page as string), +(req.query.size as string));
  }

  async getGraphData(req: Request) {
    const user = await this.auth.getUser(req);

    const queueId = req.query.queueId as string;
    const groupIris = req.query.groupIris as string[];
    const calc = req.query.calc as string;
    const calcField = req.query.calcField as string;

    return await this.queryService.getGraphData(queueId, user!, groupIris, calc, calcField);
  }
}
