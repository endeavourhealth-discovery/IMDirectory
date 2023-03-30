import ECLLexer from "../../antlr4/ecl/ECLLexer";
import ECLParser from "../../antlr4/ecl/ECLParser";
import antlr4 from "antlr4";
const { CommonTokenStream, InputStream } = antlr4;

export default function setupTree(ecl: string) {
  const chars = new InputStream(ecl, true);
  const lexer = new ECLLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new ECLParser(tokens);
  parser.buildParseTrees = true;
  parser.removeErrorListeners();
  parser.addErrorListener(new EclParseErrorListener());
  const tree = parser.ecl();
  return tree;
}

class EclParseErrorListener extends antlr4.error.ErrorListener {
  syntaxError(recogniser: any, offendingSymbol: any, line: any, column: any, msg: any, err: any) {
    throw new Error(`Invalid ecl. ${offendingSymbol} line ${line}, col ${column}: ${msg}`);
  }
}
