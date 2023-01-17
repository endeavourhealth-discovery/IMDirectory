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
        this.router.get("/ValueSet/:iri", (req,res, next) => this.getValueSet(req, res, next,false));
        this.router.get("/ValueSet/:iri/[\$]expand", (req,res, next) => this.getValueSet(req, res, next,true));
    }

    async getValueSet(req: Request, res: Response, next: NextFunction,expand:boolean) {
        try {
            const data = await this.service.getValueSet(req.params.iri as string, expand);
            res
                .setHeader('content-type','application/fhir+json')
                .send(data)
                .end();
        } catch (e) {
            next(e);
        }
    }
}