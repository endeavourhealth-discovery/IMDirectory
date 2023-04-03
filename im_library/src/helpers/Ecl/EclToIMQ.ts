import setupTree from "./SetupTree";
import ECLToIMQVisitor from "../../antlr4/ecl/ECLToIMQVisitor";
import { CustomError } from "../../models";
import { ErrorType } from "../../enums";

export function eclToIMQ(ecl: string) {
  try {
    const tree = setupTree(ecl);
    const visitor = new ECLToIMQVisitor();
    const result = visitor.visit(tree);
    return result;
  } catch (error) {
    if (error instanceof Error) throw new CustomError(error.message, ErrorType.InvalidEclError);
    else throw error;
  }
}
