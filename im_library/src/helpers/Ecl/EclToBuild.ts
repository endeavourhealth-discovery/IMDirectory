import ECLBuilderVisitor from "../../antlr4/ecl/ECLBuilderVisitor";
import { ErrorType } from "../../enums";
import { CustomError } from "../../models";
import setupTree from "./SetupTree";

export function eclToBuild(ecl: string) {
  try {
    const tree = setupTree(ecl);
    const visitor = new ECLBuilderVisitor();
    const result = visitor.visit(tree);
    return result;
  } catch (error) {
    if (error instanceof Error) throw new CustomError(error.message, ErrorType.InvalidEclError);
    else throw error;
  }
}
