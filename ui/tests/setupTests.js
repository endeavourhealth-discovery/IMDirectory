import { setupServer } from "msw/node";
import { handlers, handlersFaker } from "@/mocks/handlers";
import { describe, vi, it, expect, beforeEach, beforeAll, afterAll, afterEach } from "vitest";

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
