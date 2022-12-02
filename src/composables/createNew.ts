import { getFAIconFromType } from "@/im_library/helpers/modules/ConceptTypeMethods";
import { AllowableChildProperty, IMTreeNode, TTIriRef } from "@/im_library/interfaces";
import { DirectService, EntityService, QueryService } from "@/im_library/services";
import { IM } from "@/im_library/vocabulary";
import { TreeNode } from "primevue/tree";
import { Ref } from "vue";

function createNew() {
  const directService = new DirectService();
  const selectionWrapper = [
    {
      label: "New",
      icon: "fas fa-fw fa-plus",
      items: [] as any[]
    }
  ];

  async function getCreateOptions(newFolderName: Ref<string>, newFolder: Ref<IMTreeNode>, node: IMTreeNode): Promise<any[]> {
    const selectionWrapperCopy = [...selectionWrapper];
    let allowableTypes = [] as AllowableChildProperty[];
    for (const conceptType of node.conceptTypes) {
      const types = await QueryService.getAllowableChildTypes(conceptType["@id"]);
      allowableTypes = allowableTypes.concat(types);
    }

    for (const allowableType of allowableTypes) {
      const item = {
        label: allowableType["http://www.w3.org/2000/01/rdf-schema#label"],
        data: { type: allowableType["@id"], property: allowableType["http://www.w3.org/ns/shacl#property"][0]["http://www.w3.org/ns/shacl#path"][0]["@id"] },
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
    console.log(selectionWrapperCopy[0].items.length);

    return selectionWrapperCopy;
  }
  return { getCreateOptions };
}

export default createNew;
