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
    for (const conceptType of node.conceptTypes) {
      const types = await QueryService.getAllowableChildTypes(conceptType["@id"]);
      allowableTypes = allowableTypes.concat(types);
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
        data: { type: allowableType["@id"], property: allowableType["http://www.w3.org/ns/shacl#property"][0]["http://www.w3.org/ns/shacl#path"]["@id" as any].toString() },
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
