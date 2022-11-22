import ReleaseNotes from "../../../src/components/modules/ReleaseNotes.vue";
import { render, fireEvent, within, getAllByTestId } from "@testing-library/vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakerFactory } from "../../setupTests";
import axios from "axios";
import { flushPromises } from "@vue/test-utils";
import { GithubService } from "../../../src/services/Services";
import PrimeVue from "primevue/config";
import StyleClass from "primevue/styleclass";

describe("ReleaseNotes.vue ___ version mismatch", () => {
  let component;
  let getLatestReleaseSpy;
  let getReleasesSpy;
  let setItemSpy;
  let getItemSpy;
  let testLatestRelease = fakerFactory.githubRelease.create();
  let testReleases = [fakerFactory.githubRelease.create(), fakerFactory.githubRelease.create(), fakerFactory.githubRelease.create()];

  beforeEach(async () => {
    vi.resetAllMocks();
    getLatestReleaseSpy = vi.spyOn(GithubService.prototype, "getLatestRelease").mockResolvedValue(testLatestRelease);
    getReleasesSpy = vi.spyOn(GithubService.prototype, "getReleases").mockResolvedValue(testReleases);
    setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => vi.fn());
    getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue("v0.1.0");

    component = render(ReleaseNotes, {
      global: {
        components: { Dialog, Button, ProgressSpinner },
        provide: { axios: axios },
        plugins: [PrimeVue],
        directives: { styleclass: StyleClass }
      },
      props: { appVersion: "v1.0.0", repositoryName: "IMDirectory" }
    });
    await flushPromises();
    vi.clearAllMocks();
  });

  it("opens dialog if versions don't match", () => {
    component.getByTestId("dialog-visible-true");
  });

  it("shows latest release for prop app", () => {
    component.getByText(text => text.endsWith(testLatestRelease.version));
    component.getByText(text => text.endsWith(testLatestRelease.publishedDate));
    component.getByText(testLatestRelease.url);
    component.getByText(testLatestRelease.releaseNotes[0]);
    const button = component.getByTestId("expand-button-directory");
    expect(button.classList.contains("pi-minus"));
  });

  it("can expand all app releases", async () => {
    const button = component.getByTestId("expand-all-button");
    await fireEvent.click(button);
    await flushPromises();
    expect(getLatestReleaseSpy).toHaveBeenCalledTimes(4);
    expect(getLatestReleaseSpy).toHaveBeenCalledWith("IMAuth");
    expect(getLatestReleaseSpy).toHaveBeenCalledWith("IMEditor");
    expect(getLatestReleaseSpy).toHaveBeenCalledWith("ImportData");
    expect(getLatestReleaseSpy).toHaveBeenCalledWith("IMViewer");
    const authButton = component.getByTestId("expand-button-auth");
    expect(authButton.classList.contains("pi-minus"));
    const directoryButton = component.getByTestId("expand-button-directory");
    expect(directoryButton.classList.contains("pi-minus"));
    const editorButton = component.getByTestId("expand-button-editor");
    expect(editorButton.classList.contains("pi-minus"));
    const importDataButton = component.getByTestId("expand-button-importData");
    expect(importDataButton.classList.contains("pi-minus"));
    const viewerButton = component.getByTestId("expand-button-viewer");
    expect(viewerButton.classList.contains("pi-minus"));
  });

  it("can get olderReleaseNotes", async () => {
    const button = component.getByTestId("get-older-release-notes-button");
    await fireEvent.click(button);
    expect(getReleasesSpy).toHaveBeenCalledTimes(1);
    expect(getReleasesSpy).toHaveBeenCalledWith("IMDirectory");
    await flushPromises();
    component.getByText(testReleases[0].version);
    component.getByText(testReleases[1].version);
    component.getByText(testReleases[2].version);
  });

  it("gets releases on expand if not props repo", async () => {
    const testLatestRelease2 = fakerFactory.githubRelease.create();
    getLatestReleaseSpy.mockResolvedValue(testLatestRelease2);
    const button = component.getByTestId("expand-button-auth");
    await fireEvent.click(button);
    await flushPromises();
    expect(getLatestReleaseSpy).toHaveBeenCalledTimes(1);
    expect(getLatestReleaseSpy).toHaveBeenCalledWith("IMAuth");
    component.getByText(testLatestRelease2.version);
    const authButton = component.getByTestId("expand-button-auth");
    expect(authButton.classList.contains("pi-minus"));
  });

  it("can hide older releases", async () => {
    const button = component.getByTestId("get-older-release-notes-button");
    await fireEvent.click(button);
    expect(getReleasesSpy).toHaveBeenCalledTimes(1);
    expect(getReleasesSpy).toHaveBeenCalledWith("IMDirectory");
    await flushPromises();
    component.getByText(testReleases[0].version);
    component.getByText(testReleases[1].version);
    component.getByText(testReleases[2].version);
    const hideButton = component.getByTestId("hide-older-release-notes-button");
    await fireEvent.click(hideButton);
    await flushPromises();
    expect(component.queryByText(testReleases[1].title)).toBeNull();
  });

  it("saves to local storage on close", async () => {
    const button = component.getByTestId("close-button");
    await fireEvent.click(button);
    expect(setItemSpy).toHaveBeenCalledOnce();
    expect(setItemSpy).toHaveBeenCalledWith("IMDirectoryVersion", testLatestRelease.version);
  });

  it("saves all opened on close", async () => {
    const expandAllbutton = component.getByTestId("expand-all-button");
    await fireEvent.click(expandAllbutton);
    await flushPromises();
    const button = component.getByTestId("close-button");
    await fireEvent.click(button);
    expect(setItemSpy).toHaveBeenCalledTimes(5);
    expect(setItemSpy).toHaveBeenCalledWith("IMDirectoryVersion", testLatestRelease.version);
    expect(setItemSpy).toHaveBeenCalledWith("IMAuthVersion", testLatestRelease.version);
    expect(setItemSpy).toHaveBeenCalledWith("ImportDataVersion", testLatestRelease.version);
    expect(setItemSpy).toHaveBeenCalledWith("IMEditorVersion", testLatestRelease.version);
    expect(setItemSpy).toHaveBeenCalledWith("IMViewerVersion", testLatestRelease.version);
  });
});

describe("ReleaseNotes.vue ___ version match", () => {
  let component;
  let getLatestReleaseSpy;
  let getReleasesSpy;
  let setItemSpy;
  let getItemSpy;
  let testLatestRelease = fakerFactory.githubRelease.create();
  let testReleases = [fakerFactory.githubRelease.create(), fakerFactory.githubRelease.create(), fakerFactory.githubRelease.create()];

  beforeEach(async () => {
    vi.resetAllMocks();
    getLatestReleaseSpy = vi.spyOn(GithubService.prototype, "getLatestRelease").mockResolvedValue(testLatestRelease);
    getReleasesSpy = vi.spyOn(GithubService.prototype, "getReleases").mockResolvedValue(testReleases);
    setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => vi.fn());
    getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue("v1.0.0");

    component = render(ReleaseNotes, {
      global: {
        components: { Dialog, Button, ProgressSpinner },
        provide: { axios: axios },
        plugins: [PrimeVue],
        directives: { styleclass: StyleClass }
      },
      props: { appVersion: "v1.0.0", repositoryName: "IMDirectory" }
    });
    await flushPromises();
    vi.clearAllMocks();
  });

  it("doesn't open dialog if versions match", () => {
    expect(component.queryByTestId("dialog-visible-false")).toBeNull();
  });
});
