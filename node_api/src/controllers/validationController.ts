import express, { NextFunction, Request, Response } from "express";
import Validator from "../logic/validator";
import router from "express-promise-router";

export default class ValidationController {
  public path = "/";
  public router = router();
  private validator: Validator;

  constructor() {
    this.initRoutes();
    this.validator = new Validator();
  }

  private initRoutes() {
    this.router.post("/node_api/validation/public/validate", (req, res, next) =>
      this.validate(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
  }

  async validate(req: Request): Promise<{ isValid: boolean; message?: string }> {
    const validationIri = req.query.iri as string;
    if (!validationIri) throw new Error("Missing validation iri");
    const data = req.body;
    return this.validator.validate(validationIri, data);
  }
}
