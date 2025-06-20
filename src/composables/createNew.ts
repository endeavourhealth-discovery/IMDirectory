import { getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { DirectService, EntityService } from "@/services";
import { IM, RDFS, SHACL } from "@/vocabulary";
import type { TreeNode } from "primevue/treenode";
import { Ref } from "vue";
import { MenuItem } from "primevue/menuitem";
import { TTIriRef } from "@/interfaces/AutoGen";

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

    const allowableTypes = await EntityService.getAllowableChildTypes(node.data);
    if (!isArrayHasLength(allowableTypes)) {
      return selectionWrapperCopy;
    }
    for (const allowableType of allowableTypes) {
      const item = {
        label: allowableType[RDFS.LABEL],
        data: {
          type: allowableType.iri,
          property: allowableType[SHACL.PATH][0]["iri"].toString()
        },
        icon: getFAIconFromType([{ iri: allowableType.iri, name: allowableType[RDFS.LABEL] } as TTIriRef]).join(" "),
        command: () => {}
      };
      if (allowableType.iri === IM.FOLDER) {
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

export default createNew;
