import { expect, test } from "vitest";
import { IMQtoSQL } from "@/logic/IMQtoSQL";
import { Query } from "@im-library/interfaces/AutoGen";
import { server } from "../setupTests";
import EntityService from "@/services/entity.service";
import axios from "axios";
import { IM } from "@im-library/vocabulary";
test("IMQtoSQL", async () => {
/*    server.close();

    const svc = new EntityService(axios);
    const entity = await svc.getPartialEntity('http://endhealth.info/im#Q_TestQuery', [IM.DEFINITION]);
    let json = entity.data[IM.DEFINITION];
    const def: Query = JSON.parse(json);*/



  const def: Query = {
    "@id": "http://endhealth.info/im#Q_TestQuery",
    "name": "Test for patients either aged between 18 and 65 or with diabetes with the most recent systolic in the last 6 months >150not followed by a screening invite, excluding hypertensives",
    "match": [
/*      {

        "@set": "http://endhealth.info/im#Q_RegisteredGMS",
        "name": "Registered for GMS services on reference date"
      },*/
/*      {
        "match": [
          {
            "property": [
              {
                "@id": "http://endhealth.info/im#age",
                "range": {
                  "from": {
                    "operator": ">=",
                    "value": "65",
                    "unit": "YEARS",
                    "relativeTo": null,
                    "dataType": null
                  },
                  "to": {
                    "operator": "<",
                    "value": "70",
                    "unit": "YEARS",
                    "relativeTo": null,
                    "dataType": null
                  }
                }
              }
            ]
          },
          {
            "@set": "http://example/queries#Q_Diabetics"
          },
          {
            "property": [
              {
                "@id": "http://endhealth.info/im#observation",
                "match": {
                  "@type": "Observation",
                  "property": [
                    {
                      "@id": "http://endhealth.info/im#concept",
                      "in": [
                        {
                          "@id": "http://snomed.info/sct#714628002",
                          "descendantsOf": true
                        }
                      ],
                      "valueLabel": "Prediabetes"
                    }
                  ]
                }
              }
            ]
          }
        ],
        "bool": "or"
      }, */
      {
        "variable": "latestBP",
        "property": [
          {
            "@id": "http://endhealth.info/im#observation",
            "match": {
              "@type": "Observation",
              "bool": "and",
              "property": [
                {
                  "@id": "http://endhealth.info/im#concept",
                  "name": "concept",
                  "in": [
                    {
                      // "@id": "http://snomed.info/sct#271649006",
                      "@id": "http://snomed.info/sct#72313002",
                      "name": "Systolic blood pressure",
                      "descendantsOrSelfOf": true
                    },
                    {
                      "@id": "http://endhealth.info/emis#1994021000006104",
                      "name": "Home systolic blood pressure",
                      "descendantsOrSelfOf": true
                    }
                  ],
                  "valueLabel": "Office or home systolic blood pressure"
                },
                {
                  "@id": "http://endhealth.info/im#effectiveDate",
                  "operator": ">=",
                  "value": "-6",
                  "unit": "MONTHS",
                  "relativeTo": {
                    "parameter": "$referenceDate"
                  },
                  "valueLabel": "last 6 months"
                }
              ],
              "orderBy": [
                {
                  "direction": "descending",
                  "limit": 1,
                  "@id": "http://endhealth.info/im#effectiveDate"
                }
              ]
            }
          }
        ],
/*        "orderBy": [
          {
            "direction": "descending",
            "limit": 1,
            "@id": "http://endhealth.info/im#effectiveDate"
          }
        ]*/
      },
/*      {
        "match": [
          {
            "nodeRef": "latestBP",
            "bool": "and",
            "property": [
              {
                "@id": "http://endhealth.info/im#concept",
                "in": [
                  {
                    "@id": "http://snomed.info/sct#271649006",
                    "name": "Systolic blood pressure",
                    "descendantsOrSelfOf": true
                  }
                ],
                "valueLabel": "Office blood pressure"
              },
              {
                "@id": "http://endhealth.info/im#numericValue",
                "operator": ">",
                "value": "140"
              }
            ]
          },
          {
            "nodeRef": "latestBP",
            "bool": "and",
            "property": [
              {
                "@id": "http://endhealth.info/im#concept",
                "in": [
                  {
                    "@id": "http://endhealth.info/emis#1994021000006104",
                    "name": "Home systolic blood pressure",
                    "descendantsOrSelfOf": true
                  }
                ],
                "valueLabel": "Home blood pressure"
              },
              {
                "@id": "http://endhealth.info/im#numericValue",
                "operator": ">",
                "value": "130"
              }
            ]
          }
        ],
        "variable": "highBPReading",
        "bool": "or"
      },
      {
        "exclude": true,
        "property": [
          {
            "@id": "http://endhealth.info/im#observation",
            "match": {
              "@type": "Observation",
              "bool": "and",
              "property": [
                {
                  "@id": "http://endhealth.info/im#concept",
                  "in": [
                    {
                      "@set": "http://endhealth.info/im#InvitedForScreening"
                    }
                  ]
                },
                {
                  "@id": "http://endhealth.info/im#effectiveDate",
                  "operator": ">=",
                  "relativeTo": {
                    "@id": "http://endhealth.info/im#effectiveDate",
                    "nodeRef": "highBPReading"
                  }
                }
              ]
            }
          }
        ]
      },
      {
        "exclude": true,
        "@set": "http://endhealth.info/im#Q_Hypertensives",
        "name": "Hypertensives"
      }
*/
    ],
    "@type": "http://endhealth.info/im#Patient"
  } as Query;


  console.log(JSON.stringify(def, null, 2))

  const qry = new IMQtoSQL();
  const sql = qry.convert(def);
  console.log(sql);
  expect(sql).not.toBeNull()
  expect(sql).not.toBeUndefined()
/*  expect(sql).toEqual("WITH pat1 AS ( SELECT pat1.* FROM patient AS pat1) -- WHERE in query results http://endhealth.info/im#Q_RegisteredGMS,\n" +
    "pat3 AS ( SELECT pat3.* FROM patient AS pat3 WHERE http://endhealth.info/im#age >= 65 YEARS\n" +
    "AND http://endhealth.info/im#age > 70 YEARS),\n" +
    "pat4 AS ( SELECT pat4.* FROM patient AS pat4) -- WHERE in query results http://example/queries#Q_Diabetics,\n" +
    "pat5_sub1 AS ( SELECT pat5_sub1.* FROM event AS pat5_sub1 WHERE pat5_sub1.http://endhealth.info/im#concept IN ('http://snomed.info/sct#714628002')),\n" +
    "pat5 AS ( SELECT pat5.* FROM patient AS pat5 WHERE JOIN pat5_sub1 ON pat5.http://endhealth.info/im#observation = pat5_sub1.id),\n" +
    "pat2 AS ( SELECT pat2.* FROM patient AS pat2\n" +
    "LEFT JOIN pat3.id = pat2.id\n" +
    "LEFT JOIN pat4.id = pat2.id\n" +
    "LEFT JOIN pat5.id = pat2.id\n" +
    "WHERE pat3.id IS NOT NULL\n" +
    "or pat4.id IS NOT NULL\n" +
    "or pat5.id IS NOT NULL),\n" +
    "latestBP_sub1 AS ( SELECT latestBP_sub1.* FROM event AS latestBP_sub1 WHERE latestBP_sub1.http://endhealth.info/im#concept IN ('http://snomed.info/sct#27164" +
    "9006', 'http://endhealth.info/emis#1994021000006104') and latestBP_sub1.http://endhealth.info/im#effectiveDate >= ($referenceDate -6 MONTHS)),\n" +
    "latestBP AS ( SELECT latestBP.* FROM patient AS latestBP WHERE JOIN latestBP_sub1 ON latestBP.http://endhealth.info/im#observation = latestBP_sub1.id),\n" +
    "latestBP_part AS (<PARTITION LOGIC>)\n" +
    "SELECT pat0.id\n" +
    "FROM patient AS pat0\n" +
    "JOIN pat1 ON pat1.id = pat0.id\n" +
    "JOIN pat2 ON pat2.id = pat0.id\n" +
    "JOIN latestBP ON latestBP.id = pat0.id")*/
});
