import { setupWorker } from "msw";
import { handlers, handlersFaker } from "./handlers";

export const worker = setupWorker(...handlers);
