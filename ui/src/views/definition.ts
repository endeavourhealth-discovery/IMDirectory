export const definition = {
  "@id": "http://endhealth.info/im#Q_TestQuery",
  name: "Test for patients either aged between 18 and 65 or with diabetes with the most recent systolic in the last 6 months >150not followed by a screening invite, excluding hypertensives",
  from: {
    "@id": "http://endhealth.info/im#Patient",
    where: [
      {
        description: "Registered for gms",
        "@id": "http://endhealth.info/im#isSubsetOf",
        in: [
          {
            name: "Registered for GMS services on reference date",
            "@set": "http://example.org/qry#Q_RegisteredGMS"
          }
        ],
        valueLabel: "Registered for GMS on reference date"
      },
      {
        bool: "or",
        where: [
          {
            description: "aged between 65 and 70",
            "@id": "http://endhealth.info/im#age",
            range: {
              from: {
                operator: ">=",
                value: "65",
                unit: "YEARS",
                relativeTo: null
              },
              to: {
                operator: ">",
                value: "70",
                unit: "YEARS",
                relativeTo: null
              }
            }
          },
          {
            description: "Diabetic",
            "@id": "http://endhealth.info/im#observation",
            where: [
              {
                "@id": "http://endhealth.info/im#concept",
                in: [
                  {
                    "@set": "http://example.org/qry#Q_Diabetics"
                  },
                  {
                    "@id": "http://snomed.info/sct#714628002",
                    descendantsOf: true
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        description: "latest BP in last 6 months is >150",
        "@id": "http://endhealth.info/im#observation",
        bool: "and",
        where: [
          {
            description: "Home or office based Systolic",
            "@id": "http://endhealth.info/im#concept",
            name: "concept",
            in: [
              {
                "@id": "http://snomed.info/sct#271649006",
                name: "Systolic blood pressure"
              },
              {
                "@id": "http://endhealth.info/emis#1994021000006104",
                name: "Home systolic blood pressure"
              }
            ],
            valueLabel: "Office or home systolic blood pressure"
          },
          {
            "@id": "http://endhealth.info/im#effectiveDate",
            alias: "LastBP",
            operator: ">=",
            value: "-6",
            unit: "MONTHS",
            relativeTo: "$referenceDate",
            valueLabel: "last 6 months"
          }
        ],
        orderBy: {
          "@id": "http://endhealth.info/im#effectiveDate"
        },
        then: {
          description: ">150",
          "@id": "http://endhealth.info/im#numericValue",
          operator: ">",
          value: "150"
        }
      },
      {
        exclude: true,
        description: "exclude",
        "@id": "http://endhealth.info/im#observation",
        bool: "and",
        where: [
          {
            description: "Invited for Screening",
            "@id": "http://endhealth.info/im#concept",
            in: [
              {
                "@set": "http://endhealth.info/im#InvitedForScreening"
              }
            ]
          },
          {
            description: "after high BP",
            "@id": "http://endhealth.info/im#effectiveDate",
            operator: ">=",
            relativeTo: "LastBP"
          }
        ]
      },
      {
        exclude: true,
        description: "hypertensive",
        "@id": "http://endhealth.info/im#observation",
        where: [
          {
            "@id": "http://endhealth.info/im#concept",
            in: [
              {
                name: "Hypertensives",
                "@set": "http://example.org/qry#Hypertensives"
              }
            ]
          }
        ]
      }
    ]
  }
};
