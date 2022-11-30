import { getFAIconFromType } from "@/im_library/helpers/modules/ConceptTypeMethods";
import { DirectService, EntityService } from "@/im_library/services";
import { TreeNode } from "primevue/tree";
import { Ref } from "vue";

async function createNew() {
  const directService = new DirectService();
  const typeOptions = await EntityService.getEntityChildren("http://endhealth.info/im#EntityTypes");
  const itemList = [] as { label: string; data: string; icon: string; command: Function }[];
  for (const type of typeOptions) {
    const item = {
      label: type.name,
      data: type["@id"],
      icon: getFAIconFromType([{ "@id": type["@id"], name: type.name }]).join(" "),
      command: {} as Function
    };
    itemList.push(item);
  }

  function getCreateOptions(newFolderName: Ref<string>, newFolder: Ref<TreeNode>, node: TreeNode): { label: String; icon: String; command: Function }[] {
    const itemListCopy = [...itemList];
    for (const item of itemListCopy) {
      if ("fa-solid fa-folder" === item.icon) {
        item.command = () => {
          newFolderName.value = "";
          newFolder.value = node;
        };
      } else {
        item.command = () => directService.create(item.data, node.data);
      }
    }

    if (node.typeIcon.includes("fa-folder")) {
      return itemListCopy;
    } else if (node.typeIcon.includes("fa-lightbulb")) {
      itemListCopy.shift();
      return itemListCopy;
    }

    return itemListCopy.filter(item => item.icon.includes(node.typeIcon[1]));
  }
  return { getCreateOptions };
}

export default createNew;
