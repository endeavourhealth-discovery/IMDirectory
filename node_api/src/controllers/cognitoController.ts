import CognitoService from "@/services/cognito.service";
import express, { NextFunction, Request, Response } from "express";
import router from "express-promise-router";

export default class CognitoController {
  public path = "/node_api/cognito";
  public router = router();

  private cognitoService;

  constructor() {
    this.cognitoService = new CognitoService();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/public/isEmailRegistered", (req, res, next) =>
      this.isEmailRegistered(req)
        .then(data => res.send(data).end)
        .catch(next)
    );
  }

  async isEmailRegistered(req: Request) {
    const email = req.query.email;
    if (!email || typeof email !== "string") {
      throw new Error("Missing email parameter or email is not of type 'string'");
    } else {
      return await this.cognitoService.isEmailRegistered(email);
    }
  }
}
