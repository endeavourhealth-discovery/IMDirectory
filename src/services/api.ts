import { isObjectHasKeys, useUserStore } from "@endeavour/vue-library";

import axios, { AxiosError, AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import router from "@/router";
import { useSharedStore } from "@/stores/sharedStore";

import Env from "./Env";
import SecurityService from "./SecurityService";
import { showError } from "./toast";

const api = axios.create();

api.defaults.withCredentials = true;
api.interceptors.request.use(async (request: InternalAxiosRequestConfig) => {
  const userStore = useUserStore();
  const sharedStore = useSharedStore();
  if (userStore.isLoggedIn) {
    if (!request.headers) request.headers = {} as AxiosRequestHeaders;
    request.headers.set("Graph", userStore.includeUserGraph);
  } else if (!userStore.isLoggedIn && sharedStore.isPublicMode === false && !request.url?.startsWith(Env.API)) {
    window.location.href = await SecurityService.getLoginUrl();
  }
  return request;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: any) => {
    if (error?.response?.config?.raw) {
      if (error?.config?.responseType === "blob" && error?.response?.data) {
        error.response.data = JSON.parse(await error.response.data.text());
        return Promise.reject(error);
      } else return Promise.reject(error);
    }
    if (error?.response?.status === 403) {
      await handle403(error);
    } else if (error?.response?.status === 401) {
      await handle401(error);
    } else if (error?.response?.data?.code && error?.response?.status > 399 && error?.response?.status < 500) {
      console.error(error.response.data);
      showError(error.response.data.code, error.response.data.debugMessage);
    } else if (error?.response?.status >= 500) {
      await handle5xx(error);
    } else if (error.code === "ERR_CANCELED") {
      return;
    } else {
      return Promise.reject(error);
    }
  }
);

async function handle401(error: AxiosError) {
  showError(
    "Access denied",

    "Insufficient clearance to access " +
      error.config?.url?.substring(error.config.url.lastIndexOf("/") + 1) +
      ". Please contact an admin to change your account security clearance if you require access to this resource."
  );
  await router.push({ name: "AccessDenied" }).then();
}

async function handle403(error: any) {
  const userStore = useUserStore();
  if (userStore.isLoggedIn) {
    showError(
      "Access denied",

      "Insufficient clearance to access " +
        error.config?.url?.substring(error.config.url.lastIndexOf("/") + 1) +
        ". Please contact an admin to change your account security clearance if you require access to this resource."
    );
    await router.push({ name: "AccessDenied" }).then();
  } else {
    if (error.response?.data) {
      showError("Access denied", error.response.data.debugMessage);
    } else if (error?.config?.url) {
      showError("Access denied", "Login required for " + error.config.url.substring(error.config.url.lastIndexOf("/") + 1) + ".");
    } else {
      showError("Access denied");
    }
    if (router.currentRoute.value.path === "/user/login") {
      console.error(error);
    } else {
      window.location.href = await SecurityService.getLoginUrl();
    }
  }
}

async function handle5xx(error: any) {
  if (error.code === "ERR_BAD_RESPONSE") {
    if (error.response.data.code === "OpenSearchException") {
      showError("Error calling OpenSearch", error.response.data.debugMessage);
    } else if (error.response.data.code === "ConfigException") {
      showError("Error retrieving Github releases", error.response.data.debugMessage);
      await router.push({ name: "ServerOffline" });
    } else await router.push({ name: "ServerOffline" }).then();
  } else if (error.code === "ERR_CANCELED") {
    return;
  }
}

export default api;
