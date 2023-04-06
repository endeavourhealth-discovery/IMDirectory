import { setupServer } from "msw/node";
import { beforeAll, afterAll, afterEach, it, expect, beforeEach, describe } from "vitest";

import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";

library.add(fab);
import("@fortawesome/free-regular-svg-icons/index.js").then(module => library.add(module.far));
import("@fortawesome/free-solid-svg-icons/index.js").then(module => library.add(module.fas));

// Global canvas mock (for charts)
HTMLCanvasElement.prototype.getContext = () => {
  {
  }
};

const restHandlers = [];
const server = setupServer(...restHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});
