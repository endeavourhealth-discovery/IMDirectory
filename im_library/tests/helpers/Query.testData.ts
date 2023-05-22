export const match = {
  withType: { "@type": "Patient" },
  withSet: { "@set": "CSET_EmailOnlineEncounter" },
  withIri: { "@id": "http://snomed.info/sct#325841000000109" },
  withName: {
    name: "Text message consultation",
    "@id": "http://endhealth.info/im#1681000252102"
  },
  withNameAndEntailment: {
    name: "Text message consultation",
    descendantsOrSelfOf: true,
    "@id": "http://endhealth.info/im#1681000252102"
  },
  withExclude: { exclude: true, "@set": "http://endhealth.info/im#Q_Hypertensives" },
  withVariable: {
    path: { "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } },
    bool: "and",
    variable: "latestBP"
  },
  withOrderByWhereInAndWhereComparison: {
    path: {
      "@id": "http://endhealth.info/im#observation",
      node: {
        "@type": "Observation"
      }
    },
    bool: "and",
    where: [
      {
        "@id": "http://endhealth.info/im#concept",
        name: "concept",
        in: [
          {
            "@id": "http://snomed.info/sct#271649006",
            name: "Systolic blood pressure",
            descendantsOrSelfOf: true
          },
          {
            "@id": "http://endhealth.info/emis#1994021000006104",
            name: "Home systolic blood pressure",
            descendantsOrSelfOf: true
          }
        ],
        valueLabel: "Office or home systolic blood pressure"
      },
      {
        "@id": "http://endhealth.info/im#effectiveDate",
        operator: ">=",
        value: "-6",
        unit: "MONTHS",
        relativeTo: {
          parameter: "$referenceDate"
        },
        valueLabel: "last 6 months"
      }
    ],
    orderBy: [
      {
        direction: "descending",
        limit: 1,
        "@id": "http://endhealth.info/im#effectiveDate"
      }
    ]
  }
};

export const where = {
  withNodeRefAndComparison: { "@id": "http://endhealth.info/im#numericValue", operator: ">", value: "150", nodeRef: "latestBP" },
  withRange: {
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
  withIn: { "@id": "http://endhealth.info/im#concept", in: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }] },
  withInAndValueLabel: {
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
  withNotInAndName: {
    "@id": "http://endhealth.info/im#concept",
    notIn: [{ "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true }]
  },
  withValueLabelIn: {
    "@id": "http://endhealth.info/im#concept",
    in: [{ "@id": "http://snomed.info/sct#271649006" }, { "@id": "http://endhealth.info/emis#1994021000006104" }],
    valueLabel: "Office or home systolic blood pressure"
  },
  withcomparison: { "@id": "http://endhealth.info/im#numericValue", operator: ">", value: "150" },
  withNull: {
    null: true
  },
  after: {
    "@id": "http://endhealth.info/im#effectiveDate",
    operator: ">=",
    relativeTo: { "@id": "http://endhealth.info/im#effectiveDate", nodeRef: "latestBP" }
  },
  last6Months: {
    "@id": "http://endhealth.info/im#effectiveDate",
    operator: ">=",
    value: "-6",
    unit: "MONTHS",
    relativeTo: { "@id": "http://endhealth.info/im#$referenceDate" }
  },
  last6MonthsWithValueLabel: {
    "@id": "http://endhealth.info/im#effectiveDate",
    operator: ">=",
    value: "-6",
    unit: "MONTHS",
    relativeTo: { "@id": "http://endhealth.info/im#$referenceDate" },
    valueLabel: "last 6 months"
  }
};

export const fullTestQueryDefinition = {
  "@id": "http://endhealth.info/im#Q_TestQuery",
  name: "Test for patients either aged between 18 and 65 or with diabetes with the most recent systolic in the last 6 months >150not followed by a screening invite, excluding hypertensives",
  match: [
    { "@type": "Patient" },
    { "@set": "http://endhealth.info/im#Q_RegisteredGMS", name: "Registered for GMS services on reference date" },
    {
      boolMatch: "or",
      match: [
        {
          where: [
            {
              "@id": "http://endhealth.info/im#age",
              range: {
                from: { operator: ">=", value: "65", unit: "YEARS", relativeTo: null },
                to: { operator: ">", value: "70", unit: "YEARS", relativeTo: null }
              }
            }
          ]
        },
        { "@set": "http://example/queries#Q_Diabetics" },
        {
          path: { "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } },
          where: [
            { "@id": "http://endhealth.info/im#concept", in: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }], valueLabel: "Prediabetes" }
          ]
        }
      ]
    },
    {
      path: { "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } },
      bool: "and",
      where: [
        {
          "@id": "http://endhealth.info/im#concept",
          name: "concept",
          in: [
            { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure", descendantsOrSelfOf: true },
            { "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure", descendantsOrSelfOf: true }
          ],
          valueLabel: "Office or home systolic blood pressure"
        },
        {
          "@id": "http://endhealth.info/im#effectiveDate",
          operator: ">=",
          value: "-6",
          unit: "MONTHS",
          relativeTo: { parameter: "$referenceDate" },
          valueLabel: "last 6 months"
        }
      ],
      variable: "latestBP",
      orderBy: [{ direction: "descending", limit: 1, "@id": "http://endhealth.info/im#effectiveDate" }]
    },
    {
      boolMatch: "or",
      match: [
        {
          bool: "and",
          where: [
            { "@id": "http://endhealth.info/im#numericValue", operator: ">", value: "140", nodeRef: "latestBP" },
            {
              "@id": "http://endhealth.info/im#concept",
              in: [{ "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure", descendantsOrSelfOf: true }],
              nodeRef: "latestBP",
              valueLabel: "Office blood pressure"
            }
          ]
        },
        {
          bool: "and",
          where: [
            { "@id": "http://endhealth.info/im#numericValue", operator: ">", value: "130", nodeRef: "latestBP" },
            {
              "@id": "http://endhealth.info/im#concept",
              in: [{ "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure", descendantsOrSelfOf: true }],
              nodeRef: "latestBP",
              valueLabel: "Home blood pressure"
            }
          ]
        }
      ],
      variable: "highBPReading"
    },
    {
      exclude: true,
      path: { "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } },
      bool: "and",
      where: [
        { "@id": "http://endhealth.info/im#concept", in: [{ "@set": "http://endhealth.info/im#InvitedForScreening" }] },
        {
          "@id": "http://endhealth.info/im#effectiveDate",
          operator: ">=",
          relativeTo: { "@id": "http://endhealth.info/im#effectiveDate", nodeRef: "highBPReading" }
        }
      ]
    },
    { exclude: true, "@set": "http://endhealth.info/im#Q_Hypertensives", name: "Hypertensives" }
  ]
};
