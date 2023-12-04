import { expect, test, describe, beforeEach } from "vitest";
import { server } from "../../setupTests";
import { Query } from "@im-library/interfaces/AutoGen";
import QueryService from "@/services/query.service";
import axios from "axios";
import testData from "./IMQtoSQL.json";

describe("IMQtoSQL.ts", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi
      .fn()
      .mockResolvedValueOnce({ data: testData["Q_RegisteredGMS"] })
      .mockResolvedValueOnce({ data: testData["Q_Diabetics"] })
      .mockResolvedValueOnce({ data: testData["Q_Hypertensives"] });
  });

  test("IMQtoSQL", async () => {
    server.close();

    const queryService = new QueryService(axios);

    const def: Query = testData["Q_TestQuery"] as Query;

    const actual: string = await queryService.generateQuerySQLFromQuery(def, "2db5b8f6146941f298c1d222b3514388");

    console.log("=================================================================================================");
    console.log(actual);
    console.log("=================================================================================================");

    expect(actual).not.toBeNull();
    expect(actual).not.toBeUndefined();
    expect(actual).toEqual(testData["SQL"]);
  });
});
