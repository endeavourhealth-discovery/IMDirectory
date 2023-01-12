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
        this.router.get("/ValueSet", (req,res, next) => this.getValueSet(req, res, next));
    }

    async getValueSet(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.service.getValueSet(req.query.iri as string, req.query.expand as any);
            res.send(data).end();
        } catch (e) {
            next(e);
        }
    }
}