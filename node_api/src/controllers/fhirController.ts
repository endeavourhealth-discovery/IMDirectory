import express, { NextFunction, Request, Response } from "express";
import FhirService from "@/services/fhir.service";


export default class FhirController {
  public path = "/node_api/fhir/r4";
  public router = express.Router();
  private service: FhirService;

  constructor() {
    this.initRoutes();
    this.service = new FhirService();
  }

  private initRoutes() {

    this.router.get("/ValueSet", async (req, res, next) => {
      /*
        #swagger.summary = 'Retrieves the specified value set'
        #swagger.parameters['url'] = { in: 'query', description: 'url/iri of the value set' }
        #swagger.responses[200] = {
          description: 'Valuset successfully obtained - https://hl7.org/fhir/valueset.html#resource'
        }
      */
      return await this.getValueSet(req, res, next, false)
    });
    this.router.get("/ValueSet/[\$]expand", async (req, res, next) => {
      /*
        #swagger.path = '/ValueSet/$expand'
        #swagger.summary = 'Retrieves the specified value set and expands any subsets & members'
        #swagger.parameters['url'] = { in: 'query', description: 'url/iri of the value set' }
        #swagger.responses[200] = {
          description: 'Valuset successfully obtained and expanded - https://hl7.org/fhir/valueset.html#resource'
        }
      */
      return await this.getValueSet(req, res, next, true)
    });
    this.router.post("/ValueSet/ECL", async (req,res,next) => {
      return await this.eclToFhir(req, res, next)
    });
  }

  async getValueSet(req: Request, res: Response, next: NextFunction,expand:boolean) {
    try {
      const data = await this.service.getValueSet(req.query.url as string, expand);
      res
        .setHeader('content-type','application/fhir+json')
        .send(data)
        .end();
    } catch (e) {
      next(e);
    }
  }

  async eclToFhir(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.eclToFhir(req.body);
      res
          .setHeader('content-type', 'text/plain')
          .send(data)
          .end();
    } catch (e) {
      next(e);
    }
  }
}
