export const CSET_EncFaceToFaceOnPrem = {
  from: {
    "@id": "http://endhealth.info/im#1691000252104",
    name: "Consultation on premise",
    descendantsOrSelfOf: true
  }
};

export const CSET_EncFaceToFaceOnPremQueryDisplay = {
  children: [
    {
      key: 17403215587697707000,
      label: "must be a",
      children: [
        {
          key: 4939536282289977000,
          label: "Consultation on premise",
          type: "from",
          value: { "@id": "http://endhealth.info/im#1691000252104", name: "Consultation on premise", descendantsOrSelfOf: true },
          children: [],
          selectable: false
        }
      ]
    }
  ]
};

export const CSET_EncFaceToFaceOnPremSetQueryObject = [
  { concept: { "@id": "http://endhealth.info/im#1691000252104", name: "Consultation on premise", descendantsOrSelfOf: true }, include: true, refinements: [] }
];

export const CSET_NELChis2021 = {
  from: {
    boolFrom: "or",
    from: [
      {
        typeOf: { "@id": "http://endhealth.info/im#Concept" },
        name: "Concept",
        where: [
          {
            "@id": "http://snomed.info/sct#363589002",
            name: "Associated procedure (attribute)",
            in: [
              {
                "@id": "http://snomed.info/sct#117103007",
                name: "Administration of human immune globulin product (procedure)",
                descendantsOrSelfOf: true
              }
            ],
            anyRoleGroup: true,
            descendantsOrSelfOf: true
          }
        ]
      },
      {
        "@id": "http://snomed.info/sct#868671000000100",
        name: "Rotavirus vaccination given by other health care provider (finding)",
        descendantsOrSelfOf: true
      },
      {
        "@id": "http://snomed.info/sct#413104004",
        name: "Did not attend diphtheria, tetanus and acellular pertussis, polio and measles, mumps and rubella vaccine booster (finding)",
        descendantsOrSelfOf: true
      }
    ]
  }
};

export const CSET_NELChis2021QueryDisplay = {
  children: [
    {
      key: 1286742580876998400,
      label: "any of",
      children: [
        {
          key: 13706924740464896000,
          label: "http://endhealth.info/im#Concept",
          type: "from",
          value: { "@id": "http://endhealth.info/im#Concept" },
          children: [
            {
              key: 16763417851228312000,
              label: "http://snomed.info/sct#363589002",
              type: "propertyIs",
              value: {
                property: { "@id": "http://snomed.info/sct#363589002", name: "http://snomed.info/sct#363589002", descendantsOrSelfOf: true },
                is: { "@id": "http://snomed.info/sct#117103007", name: "http://snomed.info/sct#117103007", descendantsOrSelfOf: true }
              },
              children: [],
              selectable: false
            }
          ],
          selectable: false
        },
        {
          key: 1271618880267293700,
          label: "Gamma globulin administration (procedure)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#275844006", name: "Gamma globulin administration (procedure)", descendantsOrSelfOf: true },
          children: [],
          selectable: false
        },
        {
          key: 3747081885020497000,
          label: "First measles mumps and rubella vaccination given by other healthcare provider (finding)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#1037251000000102",
            name: "First measles mumps and rubella vaccination given by other healthcare provider (finding)",
            descendantsOrSelfOf: true
          },
          children: [],
          selectable: false
        }
      ]
    }
  ]
};

export const CSET_NELChis2021SetQueryObject = [
  {
    concept: { typeOf: { "@id": "http://endhealth.info/im#Concept", name: "Concept" } },
    include: true,
    refinements: [
      {
        property: { "@id": "http://snomed.info/sct#363589002", name: "Associated procedure (attribute)", descendantsOrSelfOf: true },
        is: { "@id": "http://snomed.info/sct#117103007", name: "Administration of human immune globulin product (procedure)", descendantsOrSelfOf: true }
      }
    ]
  },
  {
    concept: { "@id": "http://snomed.info/sct#275844006", name: "Gamma globulin administration (procedure)", descendantsOrSelfOf: true },
    include: true,
    refinements: []
  },
  {
    concept: {
      "@id": "http://snomed.info/sct#1037251000000102",
      name: "First measles mumps and rubella vaccination given by other healthcare provider (finding)",
      descendantsOrSelfOf: true
    },
    include: true,
    refinements: []
  }
];

export const CSET_EmailOnlineEncounter = {
  from: {
    boolFrom: "or",
    from: [
      {
        "@id": "http://endhealth.info/im#1681000252102",
        name: "Text message consultation",
        descendantsOrSelfOf: true
      },
      {
        "@id": "http://endhealth.info/im#901000252100",
        name: "Email consultation",
        descendantsOrSelfOf: true
      }
    ]
  }
};

export const CSET_EmailOnlineEncounterQueryDisplay = {
  children: [
    {
      key: 7921208678317353000,
      label: "any of",
      children: [
        {
          key: 5483659830858608000,
          label: "Text message consultation",
          type: "from",
          value: { "@id": "http://endhealth.info/im#1681000252102", name: "Text message consultation", descendantsOrSelfOf: true },
          children: [],
          selectable: false
        },
        {
          key: 13812800991045917000,
          label: "Email consultation",
          type: "from",
          value: { "@id": "http://endhealth.info/im#901000252100", name: "Email consultation", descendantsOrSelfOf: true },
          children: [],
          selectable: false
        }
      ]
    }
  ]
};

export const CSET_EmailOnlineEncounterSetQueryObject = [
  {
    concept: { "@id": "http://endhealth.info/im#1681000252102", name: "Text message consultation", descendantsOrSelfOf: true },
    include: true,
    refinements: []
  },
  { concept: { "@id": "http://endhealth.info/im#901000252100", name: "Email consultation", descendantsOrSelfOf: true }, include: true, refinements: [] }
];

export const CSET_OralNSAIDs = {
  from: {
    "@id": "http://snomed.info/sct#763158003",
    name: "Medicinal product (product)",
    where: [
      {
        bool: "and",
        where: [
          {
            "@id": "http://snomed.info/sct#127489000",
            name: "Has active ingredient (attribute)",
            in: [
              {
                "@id": "http://snomed.info/sct#372665008",
                name: "Non-steroidal anti-inflammatory agent (substance)",
                descendantsOrSelfOf: true
              }
            ],
            anyRoleGroup: true,
            descendantsOrSelfOf: true
          },
          {
            "@id": "http://snomed.info/sct#411116001",
            name: "Has manufactured dose form (attribute)",
            in: [
              {
                "@id": "http://snomed.info/sct#385268001",
                name: "Oral dose form (dose form)",
                descendantsOrSelfOf: true
              }
            ],
            anyRoleGroup: true,
            descendantsOrSelfOf: true
          }
        ]
      }
    ],
    descendantsOrSelfOf: true
  }
};

export const CSET_OralNSAIDsQueryDisplay = {
  children: [
    {
      key: 3369914316238540000,
      label: "must be a",
      children: [
        {
          key: 15031048831225008000,
          label: "Medicinal product (product)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#763158003",
            name: "Medicinal product (product)",
            where: {
              bool: "and",
              where: [
                {
                  "@id": "http://snomed.info/sct#127489000",
                  name: "Has active ingredient (attribute)",
                  in: [{ "@id": "http://snomed.info/sct#372665008", name: "Non-steroidal anti-inflammatory agent (substance)", descendantsOrSelfOf: true }],
                  anyRoleGroup: true
                },
                {
                  "@id": "http://snomed.info/sct#411116001",
                  name: "Has manufactured dose form (attribute)",
                  in: [{ "@id": "http://snomed.info/sct#385268001", name: "Oral dose form (dose form)", descendantsOrSelfOf: true }],
                  anyRoleGroup: true
                }
              ]
            },
            descendantsOrSelfOf: true
          },
          children: [],
          selectable: false
        },
        {
          key: 4171934515944554500,
          label: "with",
          children: [
            {
              key: 8782314670016581000,
              label: "Has active ingredient (attribute)",
              type: "propertyIs",
              value: {
                property: { "@id": "http://snomed.info/sct#127489000", name: "Has active ingredient (attribute)" },
                is: { "@id": "http://snomed.info/sct#372665008", name: "Non-steroidal anti-inflammatory agent (substance)" }
              },
              children: [],
              selectable: false
            },
            {
              key: 7529732558385236000,
              label: "Has manufactured dose form (attribute)",
              type: "propertyIs",
              value: {
                property: { "@id": "http://snomed.info/sct#411116001", name: "Has manufactured dose form (attribute)" },
                is: { "@id": "http://snomed.info/sct#385268001", name: "Oral dose form (dose form)" }
              },
              children: [],
              selectable: false
            }
          ]
        }
      ]
    }
  ]
};

export const CSET_OralNSAIDsSetQueryObject = [
  {
    concept: { "@id": "http://snomed.info/sct#763158003", name: "Medicinal product (product)", descendantsOrSelfOf: true },
    include: true,
    refinements: [
      {
        property: { "@id": "http://snomed.info/sct#127489000", name: "Has active ingredient (attribute)", descendantsOrSelfOf: true },
        is: { "@id": "http://snomed.info/sct#372665008", name: "Non-steroidal anti-inflammatory agent (substance)", descendantsOrSelfOf: true }
      },
      {
        property: { "@id": "http://snomed.info/sct#411116001", name: "Has manufactured dose form (attribute)", descendantsOrSelfOf: true },
        is: { "@id": "http://snomed.info/sct#385268001", name: "Oral dose form (dose form)", descendantsOrSelfOf: true }
      }
    ]
  }
];
