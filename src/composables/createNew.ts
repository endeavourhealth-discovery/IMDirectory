import { getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { AllowableChildProperty } from "@/interfaces";
import { DirectService, QueryService } from "@/services";
import { IM, QUERY, RDFS, SHACL } from "@/vocabulary";
import type { TreeNode } from "primevue/treenode";
import { Ref } from "vue";
import { QueryRequest } from "@/interfaces/AutoGen";
import { MenuItem } from "primevue/menuitem";

function createNew() {
  const directService = new DirectService();

  async function getCreateOptions(newFolderName: Ref<string>, newFolder: Ref<TreeNode | null>, node: TreeNode): Promise<any[]> {
    const selectionWrapperCopy = [
      {
        label: "New",
        icon: "fas fa-fw fa-plus",
        items: [] as MenuItem[]
      },
      {
        label: "Edit",
        icon: "fa-duotone fa-pen-to-square",
        command: {}
      }
    ];
    selectionWrapperCopy[1].command = () => directService.edit(node.data, true);
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
    } as QueryRequest;

    const response = await QueryService.queryIM(queryRequest);
    const types = response?.entities ?? [];
    if (isArrayHasLength(types)) allowableTypes = allowableTypes.concat(types);

    for (const currentType in node.conceptTypes) {
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
        case IM.QUERY:
          allowableTypes = getChildType(IM.QUERY, "Cohort Query", IM.DEFINITION);
          break;
        default:
          break;
      }
    }

    if (!isArrayHasLength(allowableTypes)) {
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
        command: () => {}
      };
      if (allowableType["@id"] === IM.FOLDER) {
        item.command = () => {
          newFolderName.value = "";
          newFolder.value = node;
        };
      } else {
        item.command = () => directService.create(item.data.type, item.data.property, node.data);
      }
      if (selectionWrapperCopy[0].items) selectionWrapperCopy[0].items.push(item);
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
