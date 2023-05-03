import CognitoService from "@/services/cognito.service";
import express, { NextFunction, Request, Response } from "express";

export default class CognitoController {
  public path = "/node_api/cognito";
  public router = express.Router();

  private cognitoService;

  constructor() {
    this.cognitoService = new CognitoService();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/public/isEmailRegistered", async (req, res, next) => await this.isEmailRegistered(req, res, next));
  }

  async isEmailRegistered(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.query.email;
      if (!email || typeof email !== "string") {
        throw new Error("Missing email parameter or email is not of type 'string'");
      } else {
        const result = await this.cognitoService.isEmailRegistered(email);
        res.send(result).end();
      }
    } catch (e) {
      next(e);
    }
  }
}
