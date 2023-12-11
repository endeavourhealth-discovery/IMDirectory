import express, { NextFunction, Request, Response } from "express";
import FhirService from "@/services/fhir.service";
import router from "express-promise-router";

export default class FhirController {
  public path = "/node_api/fhir/r4";
  public router = router();
  private service: FhirService;

  constructor() {
    this.initRoutes();
    this.service = new FhirService();
  }

  private initRoutes() {
    this.router.get("/ValueSet", (req, res, next) =>
      /*
        #swagger.summary = 'Retrieves the specified value set'
        #swagger.parameters['url'] = { in: 'query', description: 'url/iri of the value set' }
        #swagger.responses[200] = {
          description: 'Valuset successfully obtained - https://hl7.org/fhir/valueset.html#resource'
        }
        #swagger.responses[404] = {
          description: 'Valuset not specified or not found'
        }
      */
      this.getValueSet(req, false)
        .then(data => {
          if (!data) res.status(404).setHeader("content-type", "text/plain").send("Not found");
          else res.setHeader("content-type", "application/fhir+json").send(data);
        })
        .catch(next)
    );
    this.router.get("/ValueSet/[$]expand", (req, res, next) =>
      /*
        #swagger.path = '/ValueSet/$expand'
        #swagger.summary = 'Retrieves the specified value set and expands any subsets & members'
        #swagger.parameters['url'] = { in: 'query', description: 'url/iri of the value set' }
        #swagger.responses[200] = {
          description: 'Valuset successfully obtained and expanded - https://hl7.org/fhir/valueset.html#resource'
        }
        #swagger.responses[404] = {
          description: 'Valuset not specified or not found'
        }
      */
      this.getValueSet(req, true)
        .then(data => {
          if (!data) res.status(404).setHeader("content-type", "text/plain").send("Not found");
          else res.setHeader("content-type", "application/fhir+json").send(data);
        })
        .catch(next)
    );
    this.router.post("/ValueSet/ECL", (req, res, next) =>
      this.eclToFhir(req)
        .then(data => {
          if (!data) res.status(404).setHeader("content-type", "text/plain").send("Not found");
          else res.setHeader("content-type", "text/plain").send(data);
        })
        .catch(next)
    );
  }

  async getValueSet(req: Request, expand: boolean) {
    return await this.service.getValueSet(req.query.url as string, expand);
  }

  async eclToFhir(req: Request) {
    return await this.service.eclToFhir(req.body);
  }
}
