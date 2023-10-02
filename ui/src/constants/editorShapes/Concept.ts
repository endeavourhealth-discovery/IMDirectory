import { Argument, FormGenerator, PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import { RDF, IM, XSD, RDFS, SHACL } from "@im-library/vocabulary";

const ConceptShape: FormGenerator = {
  "@id": IM.editor.CONCEPT_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Concept shape",
  comment: "Form editor for a concept",
  targetShape: {
    "@id": IM.CONCEPT
  },
  property: [
    {
      comment: "Summary | rolegroup splitter",
      order: 1,
      name: "splitter",
      path: { "@id": IM.CONCEPT },
      minCount: 0,
      maxCount: 1,
      componentType: { "@id": IM.component.HORIZONTAL_LAYOUT },
      argument: [{ parameter: "subGroup widths", valueData: "40%,60%" }],
      property: [
        {
          comment: "Summary layout",
          name: "Summary",
          path: { "@id": IM.CONCEPT },
          showTitle: true,
          order: 1,
          maxCount: 1,
          minCount: 1,
          componentType: { "@id": IM.component.VERTICAL_LAYOUT },
          property: [
            {
              label: "Summary",
              order: 1,
              maxCount: 1,
              path: {
                "@id": IM.CONCEPT
              },
              name: "Summary",
              minCount: 0,
              componentType: {
                "@id": IM.component.CONCEPT_SUMMARY
              },
              showTitle: true,
              validation: { "@id": IM.validation.IS_SUMMARY }
            },
            {
              label: "Contained in array builder",
              name: "isContainedIn",
              showTitle: true,
              order: 1,
              minCount: 0,
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                "@id": IM.validation.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
              path: {
                "@id": IM.IS_CONTAINED_IN
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  name: "Entity",
                  order: 1,
                  minCount: 0,
                  builderChild: true,
                  componentType: {
                    "@id": IM.component.ENTITY_SEARCH
                  },
                  select: [
                    {
                      "@id": IM.query.SEARCH_FOLDERS
                    }
                  ],
                  path: {
                    "@id": IM.IS_CONTAINED_IN
                  }
                }
              ]
            },
            {
              label: "Subclass of array builder",
              name: "subclassOf",
              showTitle: true,
              order: 1,
              minCount: 0,
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                "@id": IM.validation.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
              path: {
                "@id": RDFS.SUBCLASS_OF
              },
              valueVariable: "subClassOf",
              property: [
                {
                  comment: "selects an entity based on select query",
                  name: "Entity",
                  order: 1,
                  minCount: 0,
                  builderChild: true,
                  componentType: {
                    "@id": IM.component.ENTITY_SEARCH
                  },
                  path: {
                    "@id": RDFS.SUBCLASS_OF
                  }
                }
              ]
            },
            {
              comment: "Toggle controlling sub components visibility",
              order: 8,
              name: "Replaced by",
              label: "Deactivate | Activate",
              minCount: 1,
              maxCount: 1,
              path: {
                "@id": "http://snomed.info/sct#370124000"
              },
              componentType: {
                "@id": IM.component.TOGGLEABLE
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  select: [
                    {
                      "@id": IM.query.SEARCH_ENTITIES
                    }
                  ],
                  argument: [
                    {
                      parameter: "this",
                      valueIri: {
                        "@id": IM.CONCEPT
                      }
                    }
                  ],
                  name: "Replaced by",
                  showTitle: true,
                  path: {
                    "@id": "http://snomed.info/sct#370124000"
                  },
                  minCount: 1,
                  componentType: {
                    "@id": IM.component.ENTITY_SEARCH
                  }
                }
              ]
            }
          ]
        },
        {
          name: "Splitter",
          comment: "Role group | Mapped to splitter",
          path: { "@id": IM.CONCEPT },
          order: 1,
          minCount: 0,
          maxCount: 1,
          componentType: { "@id": IM.component.VERTICAL_LAYOUT },
          property: [
            {
              label: "Property Group - Role group builder",
              order: 1,
              maxCount: 1,
              path: {
                "@id": IM.ROLE_GROUP
              },
              name: "Role group",
              minCount: 0,
              componentType: {
                "@id": IM.component.ROLE_GROUP_BUILDER
              }
            },
            {
              label: "Property Group - Mapped to array builder",
              order: 1,
              maxCount: 1,
              showTitle: true,
              path: {
                "@id": IM.MATCHED_TO
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  builderChild: true,
                  name: "Entity",
                  path: {
                    "@id": IM.MATCHED_TO
                  },
                  minCount: 0,
                  componentType: {
                    "@id": IM.component.ENTITY_SEARCH
                  }
                }
              ],
              name: "Mapped to",
              minCount: 0,
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
            },
            {
              name: "Term code",
              comment: "Term code array builder",
              order: 1,
              path: {
                "@id": IM.HAS_TERM_CODE
              },
              showTitle: true,
              minCount: 0,
              componentType: { "@id": IM.component.ARRAY_BUILDER },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: { "@id": IM.validation.IS_TERMCODE },
              property: [
                {
                  name: "Term code",
                  path: { "@id": IM.HAS_TERM_CODE },
                  builderChild: true,
                  order: 1,
                  minCount: 0,
                  componentType: { "@id": IM.component.TERM_CODE_EDITOR },
                  validation: { "@id": IM.validation.IS_TERMCODE }
                }
              ]
            },
            {
              name: "Child of",
              comment: "Child of array builder",
              order: 1,
              path: { "@id": IM.IS_CHILD_OF },
              showTitle: true,
              minCount: 0,
              componentType: { "@id": IM.component.ARRAY_BUILDER },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              property: [
                {
                  name: "Child of",
                  path: { "@id": IM.IS_CHILD_OF },
                  builderChild: true,
                  order: 1,
                  minCount: 0,
                  componentType: { "@id": IM.component.ENTITY_SEARCH }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export default ConceptShape;
