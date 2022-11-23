import { EntityReferenceNode } from "@/im_library/interfaces";
import { EntityService } from "@/im_library/services";

async function loadMore(children: any[], totalCount: number, nextPage: number, pageSize: number, loadButton: boolean, iri: string) {
  if (loadButton) {
    if (nextPage * pageSize < totalCount) {
      const result = await EntityService.getPagedChildren(iri, nextPage, pageSize);
      const resultChildren = result.result.map((child: EntityReferenceNode) => {
        return { "@id": child["@id"], name: child.name };
      });
      children = children.concat(resultChildren);
      nextPage = nextPage + 1;
      loadButton = true;
    } else if (nextPage * pageSize > totalCount) {
      const result = await EntityService.getPagedChildren(iri, nextPage, pageSize);
      const resultChildren = result.result.map((child: EntityReferenceNode) => {
        return { "@id": child["@id"], name: child.name };
      });
      children = children.concat(resultChildren);
      loadButton = false;
    } else {
      loadButton = false;
    }
  }
  return { children: children, totalCount: totalCount, nextPage: nextPage, pageSize: pageSize, loadButton: loadButton, iri: iri };
}

export default loadMore;
