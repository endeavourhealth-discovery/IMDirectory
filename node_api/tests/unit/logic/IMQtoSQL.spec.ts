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

    // console.log("=================================================================================================");
    // console.log(actual);
    console.log("=================================================================================================");

    expect(actual).not.toBeNull();
    expect(actual).not.toBeUndefined();
    expect(actual).toEqual(
      "CREATE TABLE qry_2db5b8f6146941f298c1d222b3514388 AS\n" +
        "WITH Q_2db5b8f6146941f298c1d222b3514388_16 AS (\n" +
        "WITH patient1_sub2_inner AS (\n" +
        "  SELECT patient1_sub2_inner.*\n" +
        "  FROM event AS patient1_sub2_inner\n" +
        "  JOIN tct AS tct_0 ON tct_0.child = ((patient1_sub2_inner.json ->> 'concept')::VARCHAR)\n" +
        "  WHERE ((patient1_sub2_inner.json ->> '_type')::VARCHAR) = 'Observation'\n" +
        "  AND (\n" +
        "  tct_0.iri IN ('http://snomed.info/sct#70995007',\n" +
        "  'http://snomed.info/sct#162659009'))\n" +
        "  ),\n" +
        "patient1_sub2_part AS (\n" +
        "  SELECT *, ROW_NUMBER() OVER (PARTITION BY ((json ->> 'patient')::UUID) ORDER BY (jdt(patient1_sub2_part.json -> 'effectiveDate' ->> 'dateTime')) DESC) AS rn\n" +
        "  FROM patient1_sub2_inner AS patient1_sub2_part\n" +
        "),\n" +
        "patient1_sub2_part3 AS ( \n" +
        "  SELECT patient1_sub2_part3.*\n" +
        "  FROM patient1_sub2_part AS patient1_sub2_part3\n" +
        "  JOIN tct AS tct_0 ON tct_0.child = ((patient1_sub2_part3.json ->> 'concept')::VARCHAR)\n" +
        "  WHERE tct_0.iri = 'http://snomed.info/sct#70995007' )\n" +
        ",\n" +
        "patient1_sub2 AS (\n" +
        "  SELECT patient1_sub2.*\n" +
        "  FROM patient1_sub2_part AS patient1_sub2\n" +
        "  WHERE rn = 1\n" +
        "),\n" +
        "patient1 AS (\n" +
        "  SELECT patient1.*\n" +
        "  FROM patient AS patient1\n" +
        "  JOIN patient1_sub2 ON ((patient1_sub2.json ->> 'patient')::UUID) = patient1.id\n" +
        ")\n" +
        "SELECT patient0.*\n" +
        "FROM patient AS patient0\n" +
        "JOIN patient1 ON patient1.id = patient0.id\n" +
        "),\n" +
        "Q_2db5b8f6146941f298c1d222b3514388_6 AS (\n" +
        "WITH patient1_sub2_inner AS (\n" +
        "  SELECT patient1_sub2_inner.*\n" +
        "  FROM event AS patient1_sub2_inner\n" +
        "  JOIN tct AS tct_0 ON tct_0.child = ((patient1_sub2_inner.json ->> 'concept')::VARCHAR)\n" +
        "  WHERE ((patient1_sub2_inner.json ->> '_type')::VARCHAR) = 'Observation'\n" +
        "  AND (\n" +
        "  tct_0.iri IN ('http://snomed.info/sct#73211009',\n" +
        "  'http://snomed.info/sct#315051004'))\n" +
        "  ),\n" +
        "patient1_sub2_part AS (\n" +
        "  SELECT *, ROW_NUMBER() OVER (PARTITION BY ((json ->> 'patient')::UUID) ORDER BY (jdt(patient1_sub2_part.json -> 'effectiveDate' ->> 'dateTime')) DESC) AS rn\n" +
        "  FROM patient1_sub2_inner AS patient1_sub2_part\n" +
        "),\n" +
        "patient1_sub2_part3 AS ( \n" +
        "  SELECT patient1_sub2_part3.*\n" +
        "  FROM patient1_sub2_part AS patient1_sub2_part3\n" +
        "  JOIN tct AS tct_0 ON tct_0.child = ((patient1_sub2_part3.json ->> 'concept')::VARCHAR)\n" +
        "  WHERE tct_0.iri = 'http://snomed.info/sct#73211009' )\n" +
        ",\n" +
        "patient1_sub2 AS (\n" +
        "  SELECT patient1_sub2.*\n" +
        "  FROM patient1_sub2_part AS patient1_sub2\n" +
        "  WHERE rn = 1\n" +
        "),\n" +
        "patient1 AS (\n" +
        "  SELECT patient1.*\n" +
        "  FROM patient AS patient1\n" +
        "  JOIN patient1_sub2 ON ((patient1_sub2.json ->> 'patient')::UUID) = patient1.id\n" +
        ")\n" +
        "SELECT patient0.*\n" +
        "FROM patient AS patient0\n" +
        "JOIN patient1 ON patient1.id = patient0.id\n" +
        "),\n" +
        "Q_2db5b8f6146941f298c1d222b3514388_2 AS (\n" +
        "WITH patient1_sub2 AS (\n" +
        "  SELECT patient1_sub2.*\n" +
        "  FROM event AS patient1_sub2\n" +
        "  WHERE ((patient1_sub2.json ->> '_type')::VARCHAR) = 'EpisodeOfCare'\n" +
        "  AND (\n" +
        "  ((patient1_sub2.json ->> 'patientType')::VARCHAR) = 'http://endhealth.info/im#2751000252106'\n" +
        "  \n" +
        "  AND (jdt(patient1_sub2.json -> 'effectiveDate' ->> 'dateTime')) <= $referenceDate\n" +
        "  AND (((patient1_sub2.json ->> 'endDate')::DATE) IS NULL OR ((patient1_sub2.json ->> 'endDate')::DATE) > $referenceDate))\n" +
        "  \n" +
        "),\n" +
        "patient1 AS (\n" +
        "  SELECT patient1.*\n" +
        "  FROM patient AS patient1\n" +
        "  JOIN patient1_sub2 ON ((patient1_sub2.json ->> 'patient')::UUID) = patient1.id\n" +
        ")\n" +
        "SELECT patient0.*\n" +
        "FROM patient AS patient0\n" +
        "JOIN patient1 ON patient1.id = patient0.id\n" +
        "),\n" +
        "patient1 AS (\n" +
        "  SELECT patient1.*\n" +
        "  FROM patient AS patient1\n" +
        "  JOIN Q_2db5b8f6146941f298c1d222b3514388_2 ON Q_2db5b8f6146941f298c1d222b3514388_2.id = patient1.id\n" +
        "),\n" +
        "patient4 AS (\n" +
        "  SELECT patient4.*\n" +
        "  FROM patient AS patient4\n" +
        "  WHERE (now() - INTERVAL '65 YEARS') >= (jdt(patient4.json ->> 'dateOfBirth'))\n" +
        "  AND (now() - INTERVAL '70 YEARS') < (jdt(patient4.json ->> 'dateOfBirth'))\n" +
        "),\n" +
        "patient5 AS (\n" +
        "  SELECT patient5.*\n" +
        "  FROM patient AS patient5\n" +
        "  JOIN Q_2db5b8f6146941f298c1d222b3514388_6 ON Q_2db5b8f6146941f298c1d222b3514388_6.id = patient5.id\n" +
        "),\n" +
        "patient7_sub8 AS (\n" +
        "  SELECT patient7_sub8.*\n" +
        "  FROM event AS patient7_sub8\n" +
        "  JOIN tct AS tct_0 ON tct_0.child = ((patient7_sub8.json ->> 'concept')::VARCHAR)\n" +
        "  WHERE ((patient7_sub8.json ->> '_type')::VARCHAR) = 'Observation'\n" +
        "  AND (\n" +
        "  tct_0.iri = 'http://snomed.info/sct#714628002')\n" +
        "  \n" +
        "),\n" +
        "patient7 AS (\n" +
        "  SELECT patient7.*\n" +
        "  FROM patient AS patient7\n" +
        "  JOIN patient7_sub8 ON ((patient7_sub8.json ->> 'patient')::UUID) = patient7.id\n" +
        "),\n" +
        "patient3 AS (\n" +
        "  SELECT patient3.*\n" +
        "  FROM patient AS patient3\n" +
        "  LEFT JOIN patient4 ON patient4.id = patient3.id\n" +
        "  LEFT JOIN patient5 ON patient5.id = patient3.id\n" +
        "  LEFT JOIN patient7 ON patient7.id = patient3.id\n" +
        "  WHERE patient4.id IS NOT NULL\n" +
        "  OR patient5.id IS NOT NULL\n" +
        "  OR patient7.id IS NOT NULL\n" +
        "),\n" +
        "patient9_sub10_inner AS (\n" +
        "  SELECT patient9_sub10_inner.*\n" +
        "  FROM event AS patient9_sub10_inner\n" +
        "  JOIN tct AS tct_0 ON tct_0.child = ((patient9_sub10_inner.json ->> 'concept')::VARCHAR)\n" +
        "  WHERE ((patient9_sub10_inner.json ->> '_type')::VARCHAR) = 'Observation'\n" +
        "  AND (\n" +
        "  tct_0.iri IN ('http://snomed.info/sct#271649006',\n" +
        "  'http://endhealth.info/emis#1994021000006104')\n" +
        "  AND (jdt(patient9_sub10_inner.json -> 'effectiveDate' ->> 'dateTime')) >= ($referenceDate + INTERVAL '-12 MONTHS'))\n" +
        "  ),\n" +
        "patient9_sub10_part AS (\n" +
        "  SELECT *, ROW_NUMBER() OVER (PARTITION BY ((json ->> 'patient')::UUID) ORDER BY (jdt(patient9_sub10_part.json -> 'effectiveDate' ->> 'dateTime')) DESC) AS rn\n" +
        "  FROM patient9_sub10_inner AS patient9_sub10_part\n" +
        "),\n" +
        "highBPReading AS ( WITH patient9_sub10_part11 AS (\n" +
        "    SELECT patient9_sub10_part11.*\n" +
        "    FROM patient9_sub10_part AS patient9_sub10_part11\n" +
        "    JOIN tct AS tct_0 ON tct_0.child = ((patient9_sub10_part11.json ->> 'concept')::VARCHAR)\n" +
        "    WHERE tct_0.iri = 'http://snomed.info/sct#271649006'\n" +
        "    AND ((patient9_sub10_part11.json ->> 'value')::INT) > 140\n" +
        "  ),\n" +
        "  patient9_sub10_part12 AS (\n" +
        "    SELECT patient9_sub10_part12.*\n" +
        "    FROM patient9_sub10_part AS patient9_sub10_part12\n" +
        "    JOIN tct AS tct_0 ON tct_0.child = ((patient9_sub10_part12.json ->> 'concept')::VARCHAR)\n" +
        "    WHERE tct_0.iri = 'http://endhealth.info/emis#1994021000006104'\n" +
        "    AND ((patient9_sub10_part12.json ->> 'value')::INT) > 130\n" +
        "  )\n" +
        "  SELECT highBPReading.*\n" +
        "  FROM patient9_sub10_part AS highBPReading\n" +
        "  LEFT JOIN patient9_sub10_part11 ON patient9_sub10_part11.id = highBPReading.id\n" +
        "  LEFT JOIN patient9_sub10_part12 ON patient9_sub10_part12.id = highBPReading.id\n" +
        "  WHERE patient9_sub10_part11.id IS NOT NULL\n" +
        "  OR patient9_sub10_part12.id IS NOT NULL )\n" +
        ",\n" +
        "patient9_sub10 AS (\n" +
        "  SELECT patient9_sub10.*\n" +
        "  FROM patient9_sub10_part AS patient9_sub10\n" +
        "  WHERE rn = 1\n" +
        "),\n" +
        "patient9 AS (\n" +
        "  SELECT patient9.*\n" +
        "  FROM patient AS patient9\n" +
        "  JOIN patient9_sub10 ON ((patient9_sub10.json ->> 'patient')::UUID) = patient9.id\n" +
        "),\n" +
        "patient13_sub14 AS (\n" +
        "  SELECT patient13_sub14.*\n" +
        "  FROM event AS patient13_sub14\n" +
        "  JOIN set_member patient13_sub14_mmbr ON patient13_sub14_mmbr.member = ((patient13_sub14.json ->> 'concept')::VARCHAR)\n" +
        "  JOIN highBPReading ON highBPReading.id = patient13_sub14.id\n" +
        "  WHERE ((patient13_sub14.json ->> '_type')::VARCHAR) = 'Observation'\n" +
        "  AND (\n" +
        "  patient13_sub14_mmbr.iri = 'http://endhealth.info/im#InvitedForScreening'\n" +
        "  AND (jdt(patient13_sub14.json -> 'effectiveDate' ->> 'dateTime')) >= (jdt(highBPReading.json -> 'effectiveDate' ->> 'dateTime')))\n" +
        "  \n" +
        "),\n" +
        "patient13 AS (\n" +
        "  SELECT patient13.*\n" +
        "  FROM patient AS patient13\n" +
        "  JOIN patient13_sub14 ON ((patient13_sub14.json ->> 'patient')::UUID) = patient13.id\n" +
        "),\n" +
        "patient15 AS (\n" +
        "  SELECT patient15.*\n" +
        "  FROM patient AS patient15\n" +
        "  JOIN Q_2db5b8f6146941f298c1d222b3514388_16 ON Q_2db5b8f6146941f298c1d222b3514388_16.id = patient15.id\n" +
        ")\n" +
        "SELECT patient0.*\n" +
        "FROM patient AS patient0\n" +
        "JOIN patient1 ON patient1.id = patient0.id\n" +
        "JOIN patient3 ON patient3.id = patient0.id\n" +
        "JOIN patient9 ON patient9.id = patient0.id\n" +
        "LEFT JOIN patient13 ON patient13.id = patient0.id\n" +
        "LEFT JOIN patient15 ON patient15.id = patient0.id\n" +
        "WHERE patient13.id IS NULL\n" +
        "AND patient15.id IS NULL"
    );
  });
});
