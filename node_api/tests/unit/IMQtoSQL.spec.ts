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



  const def = {
    "@id": "http://endhealth.info/im#Q_TestQuery",
    "name": "Test for patients either aged between 18 and 65 or with diabetes with the most recent systolic in the last 6 months >150not followed by a screening invite, excluding hypertensives",
    "match": [
/*      {
        "@set": "http://endhealth.info/im#Q_RegisteredGMS",
        "name": "Registered for GMS services on reference date"
      },
      {
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
                    "operator": ">",
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
      },*/
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
                      "@id": "http://snomed.info/sct#271649006",
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
              ]
            }
          }
        ],
        "orderBy": [
          {
            "direction": "descending",
            "limit": 1,
            "@id": "http://endhealth.info/im#effectiveDate"
          }
        ]
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
});
