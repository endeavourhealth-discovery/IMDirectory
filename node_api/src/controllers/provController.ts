import express, { NextFunction, Request, Response } from "express";
import ProvService from "@/services/prov.service";



export default class ProvController {
    public path ="/node_api/prov";
    public router = express.Router();
    private service: ProvService;

    constructor() {
        this.initRoutes();
        this.service = new ProvService();
    }

    private initRoutes() {
        this.router.get("/public/history",
            async (req, res, next) => this.getProvHistory(req,res,next));
    }

    async getProvHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.service.getProvHistory(req.query.url as string);
            res.send(data).end();
        } catch (e) {
            next(e);
        }
    }

}