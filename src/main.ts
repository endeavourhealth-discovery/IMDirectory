import { createApp, ComponentPublicInstance } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import VueClipboard from "vue3-clipboard";
import { worker } from "./mocks/browser";
import axios from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    raw?: boolean;
    silent?: boolean;
  }
}

declare module "vue-router" {
  interface RouteMeta {
    requiresLicense?: boolean;
    transition?: string;
    mode?: "in-out" | "out-in" | "default" | undefined;
    transitionDelay?: string;
  }
}

import "./assets/tailwind.css";

import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";

// PrimeVue Components
// import Card from "primevue/card";
// import TabPanel from "primevue/tabpanel";
// import InputText from "primevue/inputtext";
// import Tree from "primevue/tree";
// import Divider from "primevue/divider";
// import Button from "primevue/button";
// import Panel from "primevue/panel";
// import Accordion from "primevue/accordion";
// import AccordionPanel from "primevue/accordionpanel";
// import AccordionHeader from "primevue/accordionheader";
// import AccordionContent from "primevue/accordioncontent";
// import ScrollPanel from "primevue/scrollpanel";
// import Splitter from "primevue/splitter";
// import SplitterPanel from "primevue/splitterpanel";
// import Listbox from "primevue/listbox";
// import DataTable from "primevue/datatable";
// import Column from "primevue/column";
// import ColumnGroup from "primevue/columngroup"; //optional for column grouping
// import FileUpload from "primevue/fileupload";
// import OrganizationChart from "primevue/organizationchart";
// import Textarea from "primevue/textarea";
// import Select from "primevue/select";
// import ConfirmDialog from "primevue/confirmdialog";
import Tooltip from "primevue/tooltip";
// import Dialog from "primevue/dialog";
// import SplitButton from "primevue/splitbutton";
// import MultiSelect from "primevue/multiselect";
// import Popover from "primevue/popover";
// import Chart from "primevue/chart";
// import Menu from "primevue/menu";
// import ProgressSpinner from "primevue/progressspinner";
// import ProgressBar from "primevue/progressbar";
// import Menubar from "primevue/menubar";
// import Message from "primevue/message";
import ConfirmationService from "primevue/confirmationservice";
// import Avatar from "primevue/avatar";
// import MegaMenu from "primevue/megamenu";
// import Timeline from "primevue/timeline";
// import SelectButton from "primevue/selectbutton";
import ToastService from "primevue/toastservice";
// import Toast from "primevue/toast";
// import Checkbox from "primevue/checkbox";
// import PickList from "primevue/picklist";
// import ContextMenu from "primevue/contextmenu";
// import RadioButton from "primevue/radiobutton";
// import ConfirmPopup from "primevue/confirmpopup";
// import ToggleSwitch from "primevue/toggleswitch";
import StyleClass from "primevue/styleclass";
// import Tag from "primevue/tag";
// import AutoComplete from "primevue/autocomplete";
// import Breadcrumb from "primevue/breadcrumb";
// import Drawer from "primevue/drawer";
// import DataView from "primevue/dataview";
// import Chip from "primevue/chip";
// import ToggleButton from "primevue/togglebutton";
// import Skeleton from "primevue/skeleton";
import DialogService from "primevue/dialogservice";
// import DynamicDialog from "primevue/dynamicdialog";
// import Image from "primevue/image";
// import InputNumber from "primevue/inputnumber";
// import DatePicker from "primevue/datepicker";
// import TreeSelect from "primevue/treeselect";
// import Inplace from "primevue/inplace";
// import TieredMenu from "primevue/tieredmenu";
import Ripple from "primevue/ripple";
// import VirtualScroller from "primevue/virtualscroller";
// import Fieldset from "primevue/fieldset";
// import Stepper from "primevue/stepper";
// import StepList from "primevue/steplist";
// import StepPanels from "primevue/steppanels";
// import StepItem from "primevue/stepitem";
// import Step from "primevue/step";
// import StepPanel from "primevue/steppanel";
// import IconField from "primevue/iconfield";
// import InputIcon from "primevue/inputicon";
// import Tabs from "primevue/tabs";
// import TabList from "primevue/tablist";
// import Tab from "primevue/tab";
// import TabPanels from "primevue/tabpanels";
// import FloatLabel from "primevue/floatlabel";
// import InputGroup from "primevue/inputgroup";
// import InputGroupAddon from "primevue/inputgroupaddon";
// import InputOtp from "primevue/inputotp";

import { VueShowdownPlugin } from "vue-showdown";

import { Amplify } from "aws-amplify";
import { createPinia } from "pinia";
import { useSharedStore } from "@/stores/sharedStore";
import { AuthService } from "@/services";

const awsconfig = await AuthService.getConfig();
Amplify.configure(awsconfig.data);

// msw initialising
if (import.meta.env.MODE === "mock") {
  worker.start();
}

const pinia = createPinia();

const app = createApp(App)
  .use(pinia)
  .use(router)
  .use(PrimeVue, {
    ripple: true,
    local: { dateFormat: "dd/mm/yyyy" },
    theme: { preset: Aura, options: { darkModeSelector: ".my-app-dark", cssLayer: { name: "primevue", order: "theme, base, primevue" } } }
  })
  .use(ConfirmationService)
  .use(ToastService)
  .use(DialogService)
  .use(VueClipboard, {
    autoSetContainer: true,
    appendToBody: true
  })
  .use(VueShowdownPlugin, { flavor: "github" })
  .directive("tooltip", Tooltip)
  .directive("styleclass", StyleClass)
  .directive("ripple", Ripple)
  .component("IMFontAwesomeIcon", IMFontAwesomeIcon);

const sharedStore = useSharedStore();

if (window.Cypress) {
  window.__app__ = app;
}

const vm = app.mount("#app");

// Vue application exceptions
app.config.errorHandler = (err: unknown, _instance: ComponentPublicInstance | null, info: string) => {
  console.error(err);
  _instance?.$toast.add({
    severity: "error",
    summary: info,
    detail: err
  });

  sharedStore.updateError(err);
  router.push({ name: "VueError" });
};
