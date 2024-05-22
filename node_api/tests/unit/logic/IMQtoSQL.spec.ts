import { describe, expect, test } from "vitest";
import { server } from "../../setupTests";
import { Query, TTIriRef } from "@im-library/interfaces/AutoGen";
import QueryService from "@/services/query.service";
import axios from "axios";
import EntityService from "@/services/entity.service";
import { IM } from "@im-library/vocabulary";
import { Pool } from "postgresql-client";

describe("IMQtoSQL.ts", () => {
  /*  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi
      .fn()
      .mockResolvedValueOnce({ data: testData["Q_RegisteredGMS"] })
      .mockResolvedValueOnce({ data: testData["Q_Diabetics"] })
      .mockResolvedValueOnce({ data: testData["Q_Hypertensives"] });
  });*/

  test("IMQtoSQL", async () => {
    server.close();
    const svc = new EntityService(axios);
    const qry = new QueryService(axios);

    // Load query list
    const queries = await qry.getAllByType("http://endhealth.info/im#CohortQuery");
    // const queries = [{ "@id": "urn:uuid:24e136d0-22ee-4a8e-9571-db5ffe7360e9", name: "BROKEN QUERY" }];
    const dbPool = new Pool();

    try {
      for (let i = 0; i < queries.length; i++) {
        const q = queries[i];
        if ("1st MMR dose given aged 12-18 months" === q.name) {
          console.log("Testing " + i + ": " + q.name);
          const entity = await svc.getPartialEntity(q["@id"], [IM.DEFINITION]);

          let json = entity.data[IM.DEFINITION];
          const def: Query = JSON.parse(json);

          try {
            const actual: string = await qry.generateQuerySQLFromQuery(def, "2db5b8f6146941f298c1d222b3514388");

            expect(actual).not.toBeNull();
            expect(actual).not.toBeUndefined();

            let sql = "EXPLAIN " + actual;
            sql = sql?.replaceAll("$referenceDate", "NOW()");

            // console.log(sql);

            const conn = await dbPool.acquire();
            await conn
              .query(sql)
              .then((result: any) => {
                console.log("OK");
              })
              .catch((error: any) => {
                console.log("ERROR");
                console.log(sql);
                console.log(error);
                throw error;
              })
              .finally(async () => {
                await conn.close();
              });

            // Validate against postgres using EXPLAIN
          } catch (e) {
            console.error("******************** ERROR ********************");
            console.error("Error on " + i + " [" + q.name + "] (" + q["@id"] + ")");
            throw e;
          }
        }
      }
    } finally {
      await dbPool.close();
    }
  }, 10000);
});
