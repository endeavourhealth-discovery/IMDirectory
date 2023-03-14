export const queryData = [
  {
    label: "Patient",
    data: { "@id": "http://endhealth.info/im#Patient", name: "Patient" }
  },
  {
    label: "Registered for gms",
    data: {
      description: "Registered for gms",
      "@id": "http://endhealth.info/im#isSubsetOf",
      in: [
        {
          name: "Registered for GMS services on reference date",
          "@set": "http://example.org/qry#Q_RegisteredGMS"
        }
      ],
      valueLabel: "Registered for GMS on reference date"
    }
  },
  {
    label: "aged between 65 and 70 or diabetic",
    bool: "or",
    children: [
      {
        label: "aged between 65 and 70",
        data: {
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
        }
      },
      {
        label: "Diabetic",
        data: {
          description: "Diabetic",
          "@id": "http://endhealth.info/im#observation",
          where: [
            {
              "@id": "http://endhealth.info/im#concept",
              in: [{ "@set": "http://example.org/qry#Q_Diabetics" }]
            }
          ]
        }
      }
    ]
  },
  {
    label: "latest BP in last 6 months is > 150",
    data: "<div>Home or office based systolic in the last 6 months is > 150</div>",
    children: [
      {
        label: "Home or office based systolic in the last 6 months is > 150",
        data: `
                <div>Home or office based Systolic</div>
                <div>Last 6 months</div>
                <div>orderBy effectiveDate</div>
                <div>numericValue > 150</div>
              `,
        children: [
          {
            label: "Home or office based Systolic",
            data: `
                    <div>concept: </div>
                    <div>Systolic blood pressure</div>
                    <div>Home systolic blood pressure</div>
                  `
          },
          {
            label: "Last 6 months",
            data: `
                    effectiveDate >= LastBp by -6 MONTHS
                  `
          }
        ]
      }
    ]
  },
  {
    label: "not followed by screening invite or is hypertensive",
    data: `
            <div>Invited for screening after high BP</div>
            <div>Hypertensive</div>
          `,
    children: [
      {
        label: "Invited for screening after high BP",
        data: `
                <div>concept: InvitedForScreening</div>
                <div>effectiveDate >= LatBP</div>
              `
      },
      {
        label: "Hypertensive",
        data: `
                  <div>observation: Hypertensives</div>
                `
      }
    ]
  }
];

export const queryDefinition = {
  from: {
    "@id": "http://endhealth.info/im#Patient",
    where: [
      {
        description: "Registered for gms",
        "@id": "http://endhealth.info/im#isSubsetOf",
        in: [{ name: "Registered for GMS services on reference date", "@set": "http://example.org/qry#Q_RegisteredGMS" }],
        valueLabel: "Registered for GMS on reference date"
      },
      {
        description: "aged 65 to 70 or diabetic",
        bool: "or",
        where: [
          {
            description: "aged between 65 and 70",
            "@id": "http://endhealth.info/im#age",
            range: { from: { operator: ">=", value: "65", unit: null, relativeTo: null }, to: { operator: ">", value: "70", unit: null, relativeTo: null } }
          },
          {
            description: "Diabetic",
            "@id": "http://endhealth.info/im#observation",
            where: [
              {
                "@id": "http://endhealth.info/im#concept",
                in: [{ "@set": "http://example.org/qry#Q_Diabetics" }, { "@id": "http://snomed.info/sct#714628002", descendantsOf: true }]
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
                { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure" },
                { "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure" }
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
          then: { description: ">150", "@id": "http://endhealth.info/im#numericValue", operator: ">", value: "150" }
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
                  { "@id": "http://endhealth.info/im#concept", in: [{ "@set": "http://endhealth.info/im#InvitedForScreening" }] },
                  { "@id": "http://endhealth.info/im#effectiveDate", operator: ">=", relativeTo: "LastBP" }
                ]
              }
            ]
          },
          {
            description: "Hypertensive",
            "@id": "http://endhealth.info/im#observation",
            where: [{ "@id": "http://endhealth.info/im#concept", in: [{ name: "Hypertensives", "@set": "http://example.org/qry#Hypertensives" }] }]
          }
        ]
      }
    ]
  }
};
