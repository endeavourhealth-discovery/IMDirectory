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
        this.router.get("/public/dashboardLayout", async (req, res, next) => this.getDashboardLayout(req, res, next));
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

}