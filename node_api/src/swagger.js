import swaggerAutogen from "swagger-autogen";

const outputFile = "./public/swagger_output.json";
const endpointsFiles = ["./src/controllers/fhirController.ts"];
const doc = {
  info: {
    version: "1.0.0",
    title: "FHIR Value set API",
    description:
      'API for retrieving (optionally expanded) IM value sets as a FHIR R4 resource<br><br>Definition file: <a href="./swagger.json">swagger.json</a>'
  },
  host: null,
  security: [
    {
      ApiKeyAuth: []
    }
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        name: "X-Gravitee-Api-Key",
        type: "apiKey",
        in: "header"
      }
    }
  },
  basePath: "/node_api/fhir/r4",
  produces: ["application/fhir+json"] // by default: ['application/json']
};

swaggerAutogen({ openapi: "3.0.1" })(outputFile, endpointsFiles, doc);
