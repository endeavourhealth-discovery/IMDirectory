import express, { NextFunction, Request, Response } from "express";
import ConfigService from "@/services/config.service";
import { CONFIG } from "@im-library/vocabulary";

export default class ConfigController {

    public path = "/node_api/config";
    public router = express.Router();
    private configService;

    constructor() {
        this.initRoutes();
        this.configService = new ConfigService();
    }

    private initRoutes() {
        this.router.get("/public/componentLayout", async (req, res, next) => this.getComponentLayout(req, res, next));
        this.router.get("/public/filterDefaults", async (req, res, next) => this.getFilterDefaults(req, res, next));
        this.router.get("/public/dashboardLayout", async (req, res, next) => this.getDashboardLayout(req, res, next));
        this.router.get("/public/defaultPredicateNames", async (req, res, next) => this.getDefaultPredicateNames(req, res, next));
        this.router.get("/public/xmlSchemaDataTypes", async (req, res, next) => this.getXMLSchemaDataTypes(req, res, next));
        this.router.get("/public/graphExcludePredicates", async (req, res, next) => this.getGraphExcludePredicates(req, res, next));
    }

    async getComponentLayout(req: Request, res: Response, next: NextFunction) {
        try{
            if(req.query.name === "summary") {
                const data = await this.configService.getConfig(CONFIG.SUMMARY);
                res.send(data).end();
            } else if(req.query.name === "definition") {
                const data = await this.configService.getConfig(CONFIG.DEFINITION);
                res.send(data).end();
            } else {
                throw new Error("Unknown component layout config");
            }
        } catch (e) {
            next(e);
        }
    }

    //No usage
    async getFilterDefaults(req: Request, res: Response, next: NextFunction) {
        try{
            const data = await this.configService.getConfig(CONFIG.FILTER_DEFAULTS);
            res.send(data).end();
        } catch (e) {
            next(e);
        }
    }

    async getDashboardLayout(req: Request, res: Response, next: NextFunction) {
        try{
            if(req.query.name === "conceptDashboard") {
                const data = await this.configService.getConfig(CONFIG.CONCEPT_DASHBOARD);
                res.send(data).end();
            } else {
                throw new Error("Unknown dashboard layout config");
            }
        } catch (e) {
            next(e);
        }
    }

    //No usage
    async getDefaultPredicateNames(req: Request, res: Response, next: NextFunction) {
        try{
            const data = await this.configService.getConfig(CONFIG.DEFAULT_PREDICATE_NAMES);
            res.send(data).end();
        } catch (e) {
            next(e);
        }
    }

    //No usage
    async getXMLSchemaDataTypes(req: Request, res: Response, next: NextFunction) {
        try{
            const data = await this.configService.getConfig(CONFIG.XML_SCHEMA_DATATYPES);
            res.send(data).end();
        } catch (e) {
            next(e);
        }
    }

    //No usage
    async getGraphExcludePredicates(req: Request, res: Response, next: NextFunction) {
        try{
            const data = await this.configService.getConfig(CONFIG.GRAPH_EXCLUDE_PREDICATES);
            res.send(data).end();
        } catch (e) {
            next(e);
        }
    }
}