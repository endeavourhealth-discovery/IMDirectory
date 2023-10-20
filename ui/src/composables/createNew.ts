import { getFAIconFromType } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { AllowableChildProperty } from "@im-library/interfaces";
import { DirectService, QueryService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { TreeNode } from "primevue/tree";
import { Ref } from "vue";

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
    const types = await QueryService.getAllowableChildTypes(node.key as string);
    if (isArrayHasLength(types)) allowableTypes = allowableTypes.concat(types);

    const folder = [
      {
        "@id": IM.FOLDER,
        "http://www.w3.org/2000/01/rdf-schema#label": "Folder",
        "http://www.w3.org/ns/shacl#property": [
          {
            "http://www.w3.org/ns/shacl#path": { "@id": "http://endhealth.info/im#isContainedIn" }
          }
        ]
      }
    ] as AllowableChildProperty[];

    for (let currentType in node.conceptTypes) {
      if (node.conceptTypes[currentType]["@id"] === IM.FOLDER) {
        if (allowableTypes.findIndex(i => i["@id"] === IM.FOLDER) === -1) allowableTypes = folder.concat(allowableTypes);
      }
    }

    if (!isArrayHasLength(allowableTypes)) {
      selectionWrapperCopy[0].items.push({
        label: "No options",
        icon: "pi pi-ban",
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

export default createNew;
