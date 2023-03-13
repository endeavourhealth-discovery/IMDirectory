import ECLBuilderVisitor from "../../antlr4/ecl/ECLBuilderVisitor";
import setupTree from "./SetupTree";

export default function eclToBuild(ecl: string) {
  const tree = setupTree(ecl);
  const visitor = new ECLBuilderVisitor();
  const result = visitor.visit(tree);
  return result;
}
