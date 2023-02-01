import ECLLexer from "@im-library/antlr4/ecl/ECLLexer";
import ECLParser from "@im-library/antlr4/ecl/ECLParser";
import BuilderECLListener from "@im-library/antlr4/ecl/BuilderECLListener";
import ECLListener from "@im-library/antlr4/ecl/ECLListener";
import antlr4 from "antlr4";
import ECLBuilderVisitor from "@im-library/antlr4/ecl/ECLBuilderVisitor";
const { CommonTokenStream, InputStream } = antlr4;

export function eclToBuild(ecl: string) {
  const chars = new InputStream(ecl, true);
  const lexer = new ECLLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new ECLParser(tokens);
  parser.buildParseTrees = true;
  const tree = parser.ecl();
  const visitor = new ECLBuilderVisitor();
  tree.accept(visitor);
  // const ctxExpression = tree.expressionconstraint();
  // console.log(ctxExpression);
  // const ctxRefinement = ctxExpression.refinedexpressionconstraint();
  // console.log(ctxRefinement);
  // const ctxEclRefinement = ctxRefinement.eclrefinement();
  // console.log(ctxEclRefinement);
  // const conjunctionRefinement = ctxEclRefinement.conjunctionrefinementset();
  // console.log(conjunctionRefinement);
  // const ctxSubRefinement = ctxEclRefinement.subrefinement();
  // console.log(ctxSubRefinement);
  console.log(visitor.Build);
  console.log(JSON.parse(visitor.Build));
  // let buildObject = {};
  // const builderEcl = new BuilderECLListener(buildObject);
  // const eclListener = new ECLListener();
  // antlr4.tree.ParseTreeWalker.DEFAULT.walk(eclListener, tree);
  return true;
}

export default { eclToBuild };
