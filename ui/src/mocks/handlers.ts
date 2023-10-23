import { http } from "msw";
import { IM } from "@im-library/vocabulary";
import { fakerFactory } from "@im-library/mocks/fakerFactory";

const apiUrl = "http://localhost:8082/imapi/api/";

export const handlers = [
  http.get(apiUrl + "entity/public/children", async ({ request }) => {
    const url = new URL(request.url);
    const iri = url.searchParams.get("iri");
    if (iri === IM.STATUS) {
      return new Response(JSON.stringify([IM.ACTIVE, IM.DRAFT, IM.INACTIVE]), {
        headers: {
          "Content-Type": "application/json"
        },
        status: 200
      });
    } else {
      return new Response(
        JSON.stringify({
          errorMessage: "Fetch mocking is active for this api url. Please mock the fetch request for this url parameter/body in src/mocks/handler.js"
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 500
        }
      );
    }
  }),
  http.post(apiUrl + "query/public/entityQuery", async ({ request }) => {
    const body: any = await request.json();
    const { queryIri, argument } = body;
    if (queryIri["@id"] === "http://endhealth.info/im#Query_GetIsas") {
      if (argument.this === "http://endhealth.info/im#Status") {
        return new Response(
          JSON.stringify([
            { "@id": IM.ACTIVE, "http://www.w3.org/2000/01/rdf-schema#label": "Active" },
            { "@id": IM.DRAFT, "http://www.w3.org/2000/01/rdf-schema#label": "Draft" },
            { "@id": IM.INACTIVE, "http://www.w3.org/2000/01/rdf-schema#label": "Inactive" }
          ]),
          {
            headers: {
              "Content-Type": "application/json"
            },
            status: 500
          }
        );
      } else {
        return new Response(JSON.stringify([]), {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        });
      }
    } else {
      return new Response(
        JSON.stringify({
          errorMessage: "Fetch mocking is active for this api url. Please mock the fetch request for this url parameter/body in src/mocks/handler.js"
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 500
        }
      );
    }
  }),
  http.post(apiUrl + "function/public/callFunction", async ({ request }) => {
    const body: any = await request.json();
    if (body.functionIri === "http://endhealth.info/im#GetAdditionalAllowableTypes") {
      return new Response(JSON.stringify([]), {
        headers: {
          "Content-Type": "application/json"
        },
        status: 200
      });
    } else {
      return new Response(
        JSON.stringify({
          errorMessage: "Fetch mocking is active for this api url. Please mock the fetch request for this url parameter/body in src/mocks/handler.js"
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 500
        }
      );
    }
  })
];

export const handlersFaker = [
  http.get(apiUrl + "entity/public/partial", async ({ request }) => {
    console.log("using msw");
    const url = new URL(request.url);
    const iri = url.searchParams.get("iri");
    const predicates = url.searchParams.get("predicates");
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
    return new Response(JSON.stringify(entity), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  }),
  http.get(apiUrl + "entity/public/parents", async ({ request }) => {
    const url = new URL(request.url);
    const iri = url.searchParams.get("iri");
    return new Response(JSON.stringify([fakerFactory.entitySummary.create(), fakerFactory.entitySummary.create()]), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  }),
  http.get(apiUrl + "entity/public/childrenPaged", async ({ request }) => {
    const url = new URL(request.url);
    const iri = url.searchParams.get("iri");
    const children = [
      fakerFactory.entitySummary.create(),
      fakerFactory.entitySummary.create(),
      fakerFactory.entitySummary.create(),
      fakerFactory.entitySummary.create()
    ];
    return new Response(JSON.stringify(fakerFactory.pagedChildren.create({ result: children, totalCount: 4 })), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  }),
  http.get(apiUrl + "entity/public/summary", async ({ request }) => {
    const url = new URL(request.url);
    const iri = url.searchParams.get("iri");
    if (iri) {
      const found = fakerFactory.entitySummary.findFirst({ where: { "@id": { equals: iri } } });
      if (found) {
        return new Response(JSON.stringify(found), {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        });
      } else {
        return new Response(JSON.stringify(fakerFactory.pagedChildren.create()), {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        });
      }
    } else {
      return new Response(JSON.stringify({ errorMessage: "Missing iri parameter" }), {
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      });
    }
  })
];
