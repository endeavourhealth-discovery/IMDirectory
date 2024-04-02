import TransformService from "@/services/transform.service";
import { Request } from "express";
import router from "express-promise-router";
import axios from "axios";

export default class TransformController {
  public path = "/node_api/transform";
  public router = router();
  private transformService: TransformService;

  constructor() {
    this.initRoutes();
    this.transformService = new TransformService(axios);
  }

  private initRoutes() {
    // DataModelController
    this.router.post("/public/datamodel", (req, res, next) =>
      this.getDataModel(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("/public/datamodel/instance", (req, res, next) =>
      this.getDataModelInstanceDisplay(req)
        .then(data => res.send(data))
        .catch(next)
    );

    // JoinController
    this.router.post("/public/join", (req, res, next) =>
      this.getJoined(req)
        .then(data => res.send(data))
        .catch(next)
    );

    // JsonPathController
    this.router.post("/public/inputFromJpath", (req, res, next) =>
      this.getInputFromJpath(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("/public/jpathsFromInput", (req, res, next) =>
      this.getJsonPathOptions(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("/public/jpathTreeOptions", (req, res, next) =>
      this.getJpathTreeOptions(req)
        .then(data => res.send(data))
        .catch(next)
    );

    // ParseController
    this.router.post("/public/transformInputUpload", (req, res, next) =>
      this.getJsonFromFile(req)
        .then(data => res.send(data))
        .catch(next)
    );

    // TransformController
    this.router.get("public/functions", (req, res, next) =>
      this.getFunctions(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("public/transformed", (req, res, next) =>
      this.getTransformed(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("public/types", (req, res, next) =>
      this.getTransformTypes(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("public/rowTransformation", (req, res, next) =>
      this.getTransformedByInstruction(req)
        .then(data => res.send(data))
        .catch(next)
    );
  }

  // DataModelController
  async getDataModel(req: Request) {
    return this.transformService.generateDataModel(req.body);
  }

  async getDataModelInstanceDisplay(req: Request) {
    return this.transformService.getDataModelInstanceDisplay(req.body);
  }

  // JoinController
  async getJoined(req: Request) {
    const { inputs, instructions } = req.body;
    return this.transformService.join({ inputs, instructions });
  }

  // JsonPathController
  async getJpathTreeOptions(req: Request) {
    return this.transformService.getJpathTreeOptions(req.body);
  }

  async getJsonPathOptions(req: Request) {
    return this.transformService.getJsonPathOptions(req.body);
  }

  async getInputFromJpath(req: Request) {
    const { input, jpath } = req.body;
    return this.transformService.getInputFromJpath(input, jpath);
  }

  // ParseController
  async getJsonFromFile(req: Request) {
    if (!req.body || !req.body.fileString) throw Error("Missing required field fileString");
    return this.transformService.getJsonFromFile(req.body.fileString);
  }

  // TransformController
  async getFunctions(req: Request) {
    return this.transformService.getFunctions();
  }

  async getTransformed(req: Request) {
    const { inputJson, dataModelJson, instructions } = req.body;
    return this.transformService.getTransformed(inputJson, dataModelJson, instructions);
  }

  async getTransformTypes(req: Request) {
    return this.transformService.getTransformTypes();
  }

  async getTransformedByInstruction(req: Request) {
    const { instruction, instances, input } = req.body;
    return this.transformService.transformByInstruction(instruction, instances, input);
  }
}
