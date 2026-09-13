import { Query,Node} from "@endeavour/vue-library/models";

export type PropertyMatch = {
  typeOf: Node;
  match:Query;
  label:string;
  as?:string;
}
