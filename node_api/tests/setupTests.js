import { beforeAll, afterAll, afterEach, it, expect, beforeEach, describe } from "vitest";
import { setupServer } from "msw/node";

const restHandlers = [];
export const server = setupServer(...restHandlers);

window.happyDOM.setURL("http://localhost");

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});
