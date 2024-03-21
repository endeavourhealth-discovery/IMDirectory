import { Request } from "express";
import CodeGenService from "@/services/codegen.service";
import router from "express-promise-router";
import axios from "axios";

export default class CodeGenController {
  public path = "/node_api/codeGen";
  public router = router();
  private codeGenService;

  constructor() {
    this.initRoutes();
    this.codeGenService = new CodeGenService(axios);
  }

  private initRoutes() {
    this.router.get("/public/generateCode", async (req, res, next) =>
      this.generateCode(req)
        .then(data => res.send(data))
        .catch(next)
    );
  }

  async generateCode(req: Request) {
    if (!req.query.template) throw new Error("Both template iri and root model/folder iri required to generate code");

    return await this.codeGenService.generateCode(req.query.template as string);
  }
}
