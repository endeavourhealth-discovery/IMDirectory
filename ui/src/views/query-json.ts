export const queryData = [
  {
    name: "Patient"
  },
  {
    name: "Registered for gms",
    title: `<div>isSubsetOf: Q_RegisteredGMS</div>`
  },
  {
    name: "aged between 65 and 70",
    title: "<div>from: age >= 65 to: age > 70</div>"
  },
  {
    name: "latest BP in last 6 months is > 150",
    title: "<div>Home or office based systolic in the last 6 months is > 150</div>",
    children: [
      {
        name: "Home or office based systolic in the last 6 months is > 150",
        title: `
                <div>Home or office based Systolic</div>
                <div>Last 6 months</div>
                <div>orderBy effectiveDate</div>
                <div>numericValue > 150</div>
              `,
        children: [
          {
            name: "Home or office based Systolic",
            title: `
                    <div>concept: </div>
                    <div>Systolic blood pressure</div>
                    <div>Home systolic blood pressure</div>
                  `
          },
          {
            name: "Last 6 months",
            title: `
                    effectiveDate >= LastBp by -6 MONTHS
                  `
          }
        ]
      }
    ]
  },
  {
    name: "not followed by screening invite or is hypertensive",
    title: `
            <div>Invited for screening after high BP</div>
            <div>Hypertensive</div>
          `,
    children: [
      {
        name: "Invited for screening after high BP",
        title: `
                <div>concept: InvitedForScreening</div>
                <div>effectiveDate >= LatBP</div>
              `
      },
      {
        name: "Hypertensive",
        title: `
                  <div>observation: Hypertensives</div>
                `
      }
    ]
  }
];

export const queryDefinition = {
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
                unit: null,
                relativeTo: null
              },
              to: {
                operator: ">",
                value: "70",
                unit: null,
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
                in: [{ "@set": "http://example.org/qry#Q_Diabetics" }]
              }
            ]
          }
        ]
      },
      {
        description: "latest BP in last 6 months is >150",
        "@id": "http://endhealth.info/im#observation",
        with: {
          description: "Home or office based systolic in the last 6 months is >150",
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
              description: "Last 6 months",
              "@id": "http://endhealth.info/im#effectiveDate",
              alias: "LastBP",
              operator: ">=",
              value: "-6",
              unit: "MONTHS",
              relativeTo: "$referenceDate",
              valueLabel: "last 6 months"
            }
          ],
          orderBy: { "@id": "http://endhealth.info/im#effectiveDate" },
          then: {
            description: ">150",
            "@id": "http://endhealth.info/im#numericValue",
            operator: ">",
            value: "150"
          }
        }
      },
      {
        description: "not followed by screening invite or is hypertensive",
        bool: "not",
        where: [
          {
            description: "Invited for screening after high BP",
            "@id": "http://endhealth.info/im#observation",
            where: [
              {
                description: "Invited for Screening after high BP",
                bool: "and",
                where: [
                  {
                    "@id": "http://endhealth.info/im#concept",
                    in: [
                      {
                        "@set": "http://endhealth.info/im#InvitedForScreening"
                      }
                    ]
                  },
                  {
                    "@id": "http://endhealth.info/im#effectiveDate",
                    operator: ">=",
                    relativeTo: "LastBP"
                  }
                ]
              }
            ]
          },
          {
            description: "Hypertensive",
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
    ]
  }
};
