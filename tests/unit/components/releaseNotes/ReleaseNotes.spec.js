import ReleaseNotes from "@/components/releaseNotes/ReleaseNotes.vue";
import { describe, test, expect, beforeEach } from "vitest";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { setupServer } from "msw/node";
import { render } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import semver from "semver";

describe("Release notes dialog test ___ null", () => {
  let component;
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => null);

    component = render(ReleaseNotes, {
      global: {
        components: { Button, Dialog },
        plugins: [PrimeVue]
      }
    });
  });

  test("Displays when no local storage", () => {
    component.getByTestId("dialog-visible-true");
  });
});

describe("Release notes dialog test ___ higher", () => {
  let component;
  let getItemSpy;
  let setItemSpy;
  beforeEach(() => {
    vi.clearAllMocks();
    getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(semver.inc(process.env.npm_package_version, "minor"));
    setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    component = render(ReleaseNotes, {
      global: {
        components: { Button, Dialog },
        plugins: [PrimeVue]
      }
    });
  });

  it("Sets storage and displays when higher version", () => {
    expect(setItemSpy).toHaveBeenLastCalledWith("IMVersion", process.env.npm_package_version);
    component.getByTestId("dialog-visible-true");
  });
});

describe("Release notes dialog test ___ lower", () => {
  let component;
  let getItemSpy;
  beforeEach(() => {
    vi.clearAllMocks();
    let version = process.env.npm_package_version;
    let breakdown = version.split(".");
    let modBreakdown = breakdown.map(n => {
      if (n > 0) return n - 1;
      else return n;
    });
    let lowerVersion = modBreakdown.join(".");
    getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(lowerVersion);

    component = render(ReleaseNotes, {
      global: {
        components: { Button, Dialog },
        plugins: [PrimeVue]
      }
    });
  });

  it("Displays when lower", () => {
    component.getByTestId("dialog-visible-true");
  });
});

describe("Release notes dialog test ___ same", () => {
  let component;
  let getItemSpy;
  beforeEach(() => {
    vi.clearAllMocks();
    getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(process.env.npm_package_version);

    component = render(ReleaseNotes, {
      global: {
        components: { Button, Dialog },
        plugins: [PrimeVue]
      }
    });
  });

  it("Does not display when same version", () => {
    expect(component.queryByTestId("dialog-visible-false")).toBeNull();
  });
});
