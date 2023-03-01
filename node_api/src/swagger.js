import swaggerAutogen from "swagger-autogen";
import * as https from "https";

const outputFile = "./public/swagger_output.json";
const endpointsFiles = ["./src/controllers/fhirController.ts"];
const doc = {
  info: {
    version: "1.0.0",
    title: "FHIR Value set API",
    description: "API for retrieving (optionally expanded) IM value sets as a FHIR R4 resource"
  },
  schemes: [process.env.SWAGGER_PROTOCOL || 'http'],
  host: process.env.SWAGGER_HOSTNAME,
  basePath: "/node_api/fhir/r4",
  produces: ["application/fhir+json"] // by default: ['application/json']
};

swaggerAutogen(outputFile, endpointsFiles, doc);
