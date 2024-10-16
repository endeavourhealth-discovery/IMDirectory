import { Request } from "express";
import router from "express-promise-router";
import AuthMiddleware from "@/middlewares/auth.middleware";

export default class CognitoController {
  public path = "/node_api/cognito";
  public router = router();
  private auth: AuthMiddleware;

  constructor() {
    this.auth = new AuthMiddleware();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/public/validateToken", (req, res, next) =>
      this.isTokenValid(req)
        .then(data => res.send(data))
        .catch(next)
    );
  }

  async isTokenValid(req: Request) {
    try {
      return await this.auth.checkToken(req);
    } catch (e) {
      return false;
    }
  }
}
