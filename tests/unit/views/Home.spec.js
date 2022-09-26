import { render, fireEvent, within } from "@testing-library/vue";
import { beforeEach, describe, expect, it } from "vitest";
import Home from "@/views/Home.vue";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";

describe("Home.vue", () => {
  let component;

  beforeEach(() => {
    component = render(Home, {
      global: { components: { Splitter, SplitterPanel }, stubs: ["router-view", "InfoSideBar", "NavTree"] }
    });
  });

  it("mounts", () => {
    component.getByTestId("splitter-right");
    component.getByTestId("splitter-left");
  });
});
