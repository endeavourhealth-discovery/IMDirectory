import setupTree from "./SetupTree";
import ECLToIMQVisitor from "../../visitors/ECLToIMQVisitor";
import { CustomError } from "../../models";
import { ErrorType } from "../../enums";
import { Match } from "../../interfaces/AutoGen";

export function eclToIMQ(ecl: string): Match {
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
