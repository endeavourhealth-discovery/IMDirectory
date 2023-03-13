import setupTree from "./SetupTree";
import ECLToIMQVisitor from "../../antlr4/ecl/ECLToIMQVisitor";

export default function eclToIMQ(ecl: string) {
  const tree = setupTree(ecl);
  const visitor = new ECLToIMQVisitor();
  const result = visitor.visit(tree);
  return result;
}
