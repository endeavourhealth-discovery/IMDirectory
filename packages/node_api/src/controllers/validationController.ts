import express, { NextFunction, Request, Response } from "express";
import Validator from "../logic/validator";

export default class ValidationController {
  public path = "/";
  public router = express.Router();
  private validator: Validator;

  constructor() {
    this.initRoutes();
    this.validator = new Validator();
  }

  private initRoutes() {
    this.router.post("/node_api/validation/public/validate", (req, res, next) => this.validate(req, res, next));
  }

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const validationIri = req.query.iri as string;
      if (!validationIri) throw new Error("Missing validation iri");
      const data = req.body;
      const result = this.validator.validate(validationIri, data);
      res.send(result).end();
    } catch (e) {
      next(e);
    }
  }
}
