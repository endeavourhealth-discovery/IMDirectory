import { rest } from "msw";
import { Env } from "@/im_library/services";
import { IM } from "@/im_library/vocabulary";
import { fakerFactory } from "./factory";

const apiUrl = "http://localhost:8082/imapi/api/";

export const handlers = [
  rest.get(apiUrl + "entity/public/children", async (req, res, ctx) => {
    const iri = req.url.searchParams.get("iri");
    if (iri === IM.STATUS) return res(ctx.status(200), ctx.json([IM.ACTIVE, IM.DRAFT, IM.INACTIVE]));
    else
      return res(
        ctx.status(500),
        ctx.json({
          errorMessage: "Fetch mocking is active for this api url. Please mock the fetch request for this url parameter/body in src/mocks/handler.js"
        })
      );
  }),
  rest.post(apiUrl + "query/public/entityQuery", async (req, res, ctx) => {
    const body = await req.json();
    if (body.queryIri["@id"] === "http://endhealth.info/im#Query_GetIsas") {
      if (body.argument.this === "http://endhealth.info/im#Status")
        return res(
          ctx.status(200),
          ctx.json([
            { "@id": IM.ACTIVE, "http://www.w3.org/2000/01/rdf-schema#label": "Active" },
            { "@id": IM.DRAFT, "http://www.w3.org/2000/01/rdf-schema#label": "Draft" },
            { "@id": IM.INACTIVE, "http://www.w3.org/2000/01/rdf-schema#label": "Inactive" }
          ])
        );
      else return res(ctx.status(200), ctx.json([]));
    } else
      return res(
        ctx.status(500),
        ctx.json({
          errorMessage: "Fetch mocking is active for this api url. Please mock the fetch request for this url parameter/body in src/mocks/handler.js"
        })
      );
  }),
  rest.post(apiUrl + "function/public/callFunction", async (req, res, ctx) => {
    const body = await req.json();
    if (body.functionIri === "http://endhealth.info/im#GetAdditionalAllowableTypes") return res(ctx.status(200), ctx.json([]));
    else
      return res(
        ctx.status(500),
        ctx.json({
          errorMessage: "Fetch mocking is active for this api url. Please mock the fetch request for this url parameter/body in src/mocks/handler.js"
        })
      );
  })
];

export const handlersFaker = [
  rest.get(apiUrl + "entity/public/partial", async (req, res, ctx) => {
    console.log("using msw");
    const iri = req.url.searchParams.get("iri");
    const predicates = req.url.searchParams.get("predicates");
    const predicatesArray = predicates?.split(",");
    const entityValue = {} as any;
    if (iri) entityValue["@id"] = iri;
    if (predicatesArray && !predicatesArray.includes("http://www.w3.org/1999/02/22-rdf-syntax")) entityValue["http://www.w3.org/1999/02/22-rdf-syntax"] = null;
    if (predicatesArray && !predicatesArray.includes("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"))
      entityValue["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] = null;
    const entity = fakerFactory.entity.create(entityValue) as any;
    Object.keys(entity).forEach((key: string) => {
      if (!entity[key]) delete entity[key];
    });
    return res(ctx.status(200), ctx.json(entity));
  }),
  rest.get(apiUrl + "entity/public/parents", async (req, res, ctx) => {
    const iri = req.url.searchParams.get("iri");
    return res(ctx.status(200), ctx.json([fakerFactory.entitySummary.create(), fakerFactory.entitySummary.create()]));
  }),
  rest.get(apiUrl + "entity/public/childrenPaged", async (req, res, ctx) => {
    const iri = req.url.searchParams.get("iri");
    const children = [
      fakerFactory.entitySummary.create(),
      fakerFactory.entitySummary.create(),
      fakerFactory.entitySummary.create(),
      fakerFactory.entitySummary.create()
    ];
    return res(ctx.status(200), ctx.json(fakerFactory.pagedChildren.create({ result: children, totalCount: 4 })));
  }),
  rest.get(apiUrl + "entity/public/summary", async (req, res, ctx) => {
    const iri = req.url.searchParams.get("iri");
    if (iri) {
      const found = fakerFactory.entitySummary.findFirst({ where: { "@id": { equals: iri } } });
      if (found) return res(ctx.status(200), ctx.json(found));
      else return res(ctx.status(200), ctx.json(fakerFactory.pagedChildren.create()));
    } else return res(ctx.status(500), ctx.json({ errorMessage: "Missing iri parameter" }));
  })
];
