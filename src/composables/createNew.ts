import { getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { AllowableChildProperty } from "@/interfaces";
import { DirectService, QueryService } from "@/services";
import { IM, QUERY, RDF, RDFS, SHACL } from "@/vocabulary";
import type { TreeNode } from "primevue/treenode";
import { Ref } from "vue";
import { QueryRequest } from "@/interfaces/AutoGen";

function createNew() {
  const directService = new DirectService();

  async function getCreateOptions(newFolderName: Ref<string>, newFolder: Ref<TreeNode>, node: TreeNode): Promise<any[]> {
    const selectionWrapperCopy = [
      {
        label: "New",
        icon: "fas fa-fw fa-plus",
        items: [] as any[]
      }
    ];
    let allowableTypes = [] as AllowableChildProperty[];
    const queryRequest = {
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": node.key
          }
        }
      ],
      query: {
        "@id": QUERY.ALLOWABLE_CHILD_TYPES
      }
    } as any as QueryRequest;

    const response = await QueryService.queryIM(queryRequest);
    const types = response?.entities ?? [];
    if (isArrayHasLength(types)) allowableTypes = allowableTypes.concat(types);

    for (let currentType in node.conceptTypes) {
      switch (node.conceptTypes[currentType]["@id"]) {
        case IM.FOLDER:
          if (allowableTypes.findIndex(i => i["@id"] === IM.FOLDER) === -1)
            allowableTypes = getChildType(IM.FOLDER, "Folder", IM.IS_CONTAINED_IN).concat(allowableTypes);
          break;
        case IM.CONCEPT:
          allowableTypes = getChildType(IM.CONCEPT, "Terminology Concept", RDFS.SUBCLASS_OF);
          break;
        case IM.CONCEPT_SET:
          allowableTypes = getChildType(IM.CONCEPT_SET, "Concept Set", IM.IS_SUBSET_OF);
          break;
        case IM.VALUE_SET:
          allowableTypes = getChildType(IM.VALUE_SET, "Value Set", IM.IS_SUBSET_OF);
          break;
        case SHACL.NODESHAPE:
          allowableTypes = getChildType(SHACL.NODESHAPE, "Data Model/Node Shape", RDFS.SUBCLASS_OF);
          break;
        case IM.COHORT_QUERY:
          allowableTypes = getChildType(IM.COHORT_QUERY, "Cohort Query", IM.DEFINITION);
          break;
        default:
          break;
      }
    }

    if (!isArrayHasLength(allowableTypes)) {
      selectionWrapperCopy[0].items.push({
        label: "No options",
        icon: "fa-solid fa-ban",
        disabled: true
      });
      return selectionWrapperCopy;
    }

    for (const allowableType of allowableTypes) {
      const item = {
        label: allowableType["http://www.w3.org/2000/01/rdf-schema#label"],
        data: {
          type: allowableType["@id"],
          property: allowableType["http://www.w3.org/ns/shacl#property"][0]["http://www.w3.org/ns/shacl#path"]["@id"].toString()
        },
        icon: getFAIconFromType([{ "@id": allowableType["@id"], name: allowableType["http://www.w3.org/2000/01/rdf-schema#label"] }]).join(" "),
        command: {} as Function
      };
      if (allowableType["@id"] === IM.FOLDER) {
        item.command = () => {
          newFolderName.value = "";
          newFolder.value = node;
        };
      } else {
        item.command = () => directService.create(item.data.type, item.data.property, node.data);
      }
      selectionWrapperCopy[0].items.push(item);
    }
    return selectionWrapperCopy;
  }
  return { getCreateOptions };
}

function getChildType(type: string, label: string, path: string) {
  return [
    {
      "@id": type,
      "http://www.w3.org/2000/01/rdf-schema#label": label,
      "http://www.w3.org/ns/shacl#property": [
        {
          "http://www.w3.org/ns/shacl#path": { "@id": path }
        }
      ]
    }
  ] as AllowableChildProperty[];
}

export default createNew;
