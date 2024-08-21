import ReleaseNotes from "@/components/app/ReleaseNotes.vue";
import { render, fireEvent } from "@testing-library/vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakerFactory } from "@im-library/mocks/fakerFactory";
import axios from "axios";
import { flushPromises } from "@vue/test-utils";
import { GithubService } from "@/services";
import PrimeVue from "primevue/config";
import StyleClass from "primevue/styleclass";
import { createTestingPinia } from "@pinia/testing";
import { VueShowdownPlugin } from "vue-showdown";

createTestingPinia();

describe("ReleaseNotes.vue", () => {
  let component;
  let getLatestReleaseSpy;
  let getReleasesSpy;
  let setItemSpy;
  let getItemSpy;
  let testLatestRelease = fakerFactory.githubRelease.create();
  let testReleases = [fakerFactory.githubRelease.create(), fakerFactory.githubRelease.create(), fakerFactory.githubRelease.create()];

  beforeEach(async () => {
    vi.resetAllMocks();
    getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
    getReleasesSpy = vi.spyOn(GithubService, "getReleases").mockResolvedValue(testReleases);
    setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => vi.fn());
    getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(undefined);

    component = render(ReleaseNotes, {
      global: {
        components: { Dialog, Button, ProgressSpinner },
        provide: { axios: axios },
        plugins: [PrimeVue, VueShowdownPlugin],
        directives: { styleclass: StyleClass }
      },
      props: { appVersion: "v1.0.0", repositoryName: "IMDirectory" }
    });
    await flushPromises();
    vi.clearAllMocks();
  });

  it("shows latest release for prop app", () => {
    component.getByText(text => text.endsWith(testLatestRelease.version));
    component.getByText(text => text.endsWith(testLatestRelease.publishedDate));
    component.getByText(testLatestRelease.url);
    component.getByText(testLatestRelease.releaseNotes[0]);
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
});
