import { setupServer } from "msw/node";
import { beforeAll, afterAll, afterEach, it, expect, beforeEach, describe } from "vitest";

window.happyDOM.setURL("http://localhost");

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
