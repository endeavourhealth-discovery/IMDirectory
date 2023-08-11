import CognitoService from "@/services/cognito.service";
import { Request, Response, NextFunction } from "express";
import router from "express-promise-router";
import AuthMiddleware from "@/middlewares/auth.middleware";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";
import { checkIsValidUprnEmail } from "@/logic/isValidUprnEmail";

export default class CognitoController {
  public path = "/node_api/cognito";
  public router = router();
  private auth: AuthMiddleware;

  private cognitoService;

  constructor() {
    this.cognitoService = new CognitoService();
    this.auth = new AuthMiddleware();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/public/isEmailRegistered", (req, res, next) =>
      this.isEmailRegistered(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/public/validateToken", (req, res, next) =>
      this.isTokenValid(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/public/isValidUprnEmail", (req, res, next) =>
      this.isValidUprnEmail(req)
        .then(data => res.send(data))
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

  async isTokenValid(req: Request) {
    try {
      return await this.auth.checkToken(req);
    } catch (e) {
      return false;
    }
  }

  async isValidUprnEmail(req: Request) {
    const email = await this.auth.getEmailFromToken(req);
    if (email) {
      return checkIsValidUprnEmail(email);
    }
  }
}
