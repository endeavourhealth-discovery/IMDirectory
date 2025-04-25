import { http, HttpResponse } from "msw";
import { IM } from "@/vocabulary";
import { fakerFactory } from "@/mocks/fakerFactory";
import { isArray } from "lodash-es";

const apiUrl = "http://localhost:8082/imapi/api/";

export const handlers = [
  http.get(apiUrl + "entity/public/children", async ({ params }) => {
    const { iri } = params;
    if (iri === IM.STATUS) return HttpResponse.json([IM.ACTIVE, IM.DRAFT, IM.INACTIVE]);
    else
      return new HttpResponse(
        JSON.stringify({
          errorMessage: "Fetch mocking is active for this api url. Please mock the fetch request for this url parameter/body in src/mocks/handler.js"
        }),
        { status: 500 }
      );
  }),
  http.post(apiUrl + "query/public/entityQuery", async ({ request }) => {
    const body: any = await request.json();
    const { queryIri, argument } = body;
    if (queryIri["@id"] === "http://endhealth.info/im#Query_GetIsas") {
      if (argument.this === "http://endhealth.info/im#Status")
        return HttpResponse.json([
          { "@id": IM.ACTIVE, "http://www.w3.org/2000/01/rdf-schema#label": "Active" },
          { "@id": IM.DRAFT, "http://www.w3.org/2000/01/rdf-schema#label": "Draft" },
          { "@id": IM.INACTIVE, "http://www.w3.org/2000/01/rdf-schema#label": "Inactive" }
        ]);
      else return HttpResponse.json([]);
    } else
      return new HttpResponse(
        JSON.stringify({
          errorMessage: "Fetch mocking is active for this api url. Please mock the fetch request for this url parameter/body in src/mocks/handler.js"
        }),
        { status: 500 }
      );
  }),
  http.post(apiUrl + "function/public/callFunction", async ({ request }) => {
    const body: any = await request.json();
    const { functionIri } = body;
    if (functionIri === "http://endhealth.info/im#GetAdditionalAllowableTypes") return HttpResponse.json([]);
    else
      return new HttpResponse(
        JSON.stringify({
          errorMessage: "Fetch mocking is active for this api url. Please mock the fetch request for this url parameter/body in src/mocks/handler.js"
        }),
        { status: 500 }
      );
  })
];

export const handlersFaker = [
  http.get(apiUrl + "entity/public/partial", async ({ params }) => {
    console.log("using msw");
    const { iri, predicatesArray } = params;
    const entityValue = {} as any;
    if (iri) entityValue["@id"] = iri;
    if (predicatesArray && isArray(predicatesArray) && !predicatesArray.includes("http://www.w3.org/1999/02/22-rdf-syntax"))
      entityValue["http://www.w3.org/1999/02/22-rdf-syntax"] = null;
    if (predicatesArray && isArray(predicatesArray) && !predicatesArray.includes("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"))
      entityValue["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] = null;
    const entity = fakerFactory.entity.create(entityValue) as any;
    Object.keys(entity).forEach((key: string) => {
      if (!entity[key]) delete entity[key];
    });
    return HttpResponse.json(entity);
  }),
  http.get(apiUrl + "entity/public/parents", async () => {
    return HttpResponse.json([fakerFactory.entitySummary.create(), fakerFactory.entitySummary.create()]);
  }),
  http.get(apiUrl + "entity/public/childrenPaged", async () => {
    const children = [
      fakerFactory.entitySummary.create(),
      fakerFactory.entitySummary.create(),
      fakerFactory.entitySummary.create(),
      fakerFactory.entitySummary.create()
    ];
    return HttpResponse.json(fakerFactory.pagedChildren.create({ result: children, totalCount: 4 }));
  }),
  http.get(apiUrl + "entity/public/summary", async ({ params }) => {
    const { iri } = params;
    if (iri && typeof iri === "string") {
      const found = fakerFactory.entitySummary.findFirst({ where: { "@id": { equals: iri } } });
      if (found) return HttpResponse.json(found);
      else return HttpResponse.json(fakerFactory.pagedChildren.create());
    } else
      return new HttpResponse(
        JSON.stringify({
          errorMessage: "Missing iri parameter"
        }),
        { status: 500 }
      );
  })
];
