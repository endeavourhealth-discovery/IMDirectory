import { FormGenerator } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS, XSD } from "@im-library/vocabulary";

const FolderShape: FormGenerator = {
  "@id": IM.editor.FOLDER_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - folder shape",
  comment: "Form editor for a folder",
  targetShape: {
    "@id": IM.FOLDER
  },
  property: [
    {
      name: "Summary",
      comment: "Vertical splitter",
      path: { "@id": IM.FOLDER },
      showTitle: true,
      componentType: { "@id": IM.component.VERTICAL_LAYOUT },
      minCount: 1,
      maxCount: 1,
      order: 1,
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
          label: "Property group - Sub type array builder",
          order: 1,
          path: {
            "@id": RDFS.SUBCLASS_OF
          },
          validation: {
            "@id": IM.validation.HAS_PARENT
          },
          validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
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
              builderChild: true,
              name: "Entity",
              path: {
                "@id": RDFS.SUBCLASS_OF
              },
              minCount: 0,
              componentType: {
                "@id": IM.component.ENTITY_SEARCH
              }
            }
          ],
          name: "Subclass of",
          showTitle: true,
          minCount: 0,
          componentType: {
            "@id": IM.component.ARRAY_BUILDER
          },
          arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
        },
        {
          label: "Property group - Contained in array builder",
          order: 1,
          path: {
            "@id": IM.IS_CONTAINED_IN
          },
          property: [
            {
              comment: "selects an entity based on select query",
              order: 1,
              select: [
                {
                  "@id": IM.query.SEARCH_FOLDERS
                }
              ],
              argument: [
                {
                  parameter: "this",
                  valueIri: {
                    "@id": IM.FOLDER
                  }
                }
              ],
              builderChild: true,
              name: "Entity",
              path: {
                "@id": IM.IS_CONTAINED_IN
              },
              minCount: 0,
              componentType: {
                "@id": IM.component.ENTITY_SEARCH
              }
            }
          ],
          name: "Contained in",
          showTitle: true,
          minCount: 0,
          componentType: {
            "@id": IM.component.ARRAY_BUILDER
          },
          arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
        },
        {
          comment: "Toggle controlling sub components visibility",
          order: 7,
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
                    "@id": IM.FOLDER
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
    }
  ]
};

export default FolderShape;
