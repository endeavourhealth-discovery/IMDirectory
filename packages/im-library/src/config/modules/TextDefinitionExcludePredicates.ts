import { SHACL } from "../../vocabulary/index.js";

const TEXT_DEFINITION_EXCLUDE_PREDICATES = [SHACL.PROPERTY] as string[];

export default [...TEXT_DEFINITION_EXCLUDE_PREDICATES];
