import ECLLexer from "@im-library/antlr4/ecl/ECLLexer";
import ECLParser from "@im-library/antlr4/ecl/ECLParser";
import BuilderECLListener from "@im-library/antlr4/ecl/BuilderECLListener";
import ECLListener from "@im-library/antlr4/ecl/ECLListener";
import antlr4 from "antlr4";
import ECLBuilderVisitor from "@im-library/antlr4/ecl/ECLBuilderVisitor";
import ECLToIMQVisitor from "@im-library/antlr4/ecl/ECLToIMQVisitor";
const { CommonTokenStream, InputStream } = antlr4;

export function eclToBuild(ecl: string) {
  const tree = setupTree(ecl);
  const visitor = new ECLBuilderVisitor();
  const result = visitor.visit(tree);
  const resultAsJson = JSON.stringify(result);
  console.log(resultAsJson);
  return resultAsJson;
}

export function eclToIMQ(ecl: string) {
  const tree = setupTree(ecl);
  const visitor = new ECLToIMQVisitor();
  const result = visitor.visit(tree);
  const resultAsJson = JSON.stringify(result);
  console.log(resultAsJson);
  return result;
}

function setupTree(ecl: string) {
  const chars = new InputStream(ecl, true);
  const lexer = new ECLLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new ECLParser(tokens);
  parser.buildParseTrees = true;
  const tree = parser.ecl();
  return tree;
}

export default { eclToBuild, eclToIMQ };
