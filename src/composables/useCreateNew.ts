import { Ref } from "vue";

import { IM, RDFS, SHACL } from "@endeavour/vue-library/enums";
import { getFAIconFromType, isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { TTIriRef } from "@endeavour/vue-library/interfaces";

import { MenuItem } from "primevue/menuitem";
import type { TreeNode } from "primevue/treenode";

import AlertDialog from "@/components/shared/dynamicDialogs/AlertDialog.vue";
import { EntityService } from "@/services";
import { useDialogStore } from "@/stores/dialogStore";

import { useDirectService } from "./useDirectService";

export function useCreateNew() {
  const directService = useDirectService();
  const dialogStore = useDialogStore();

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
    selectionWrapperCopy[1].command = () => directService.edit(node.data, false);

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

  async function checkExists(iri: string): Promise<boolean> {
    if (await EntityService.entityExists(iri)) {
      await dialogStore.open(AlertDialog, {
        props: { modal: true, style: { width: "30vw" }, closable: false },
        data: {
          icon: "fa-regular fa-circle-exclamation",
          title: "Warning",
          text: "Entity with this iri already exists.",
          confirmButtonText: "Close"
        }
      });
      return true;
    } else return false;
  }

  return { getCreateOptions, checkExists };
}
