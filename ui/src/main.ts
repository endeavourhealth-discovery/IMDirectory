import { createApp, ComponentPublicInstance } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import VueClipboard from "vue3-clipboard";
import { worker } from "./mocks/browser";
import axios from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    raw?: boolean;
    silent?: boolean;
  }
}

// Font Awesome
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";

library.add(fab);

import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";

dom.watch();

// PrimeVue Components
import Card from "primevue/card";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import InputText from "primevue/inputtext";
import Tree from "primevue/tree";
import Divider from "primevue/divider";
import Button from "primevue/button";
import Panel from "primevue/panel";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import ScrollPanel from "primevue/scrollpanel";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import Listbox from "primevue/listbox";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup"; //optional for column grouping
import FileUpload from "primevue/fileupload";
import OrganizationChart from "primevue/organizationchart";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import ConfirmDialog from "primevue/confirmdialog";
import Tooltip from "primevue/tooltip";
import Dialog from "primevue/dialog";
import SplitButton from "primevue/splitbutton";
import MultiSelect from "primevue/multiselect";
import OverlayPanel from "primevue/overlaypanel";
import Chart from "primevue/chart";
import Menu from "primevue/menu";
import ProgressSpinner from "primevue/progressspinner";
import Menubar from "primevue/menubar";
import InlineMessage from "primevue/inlinemessage";
import Message from "primevue/message";
import ConfirmationService from "primevue/confirmationservice";
import Avatar from "primevue/avatar";
import MegaMenu from "primevue/megamenu";
import Timeline from "primevue/timeline";
import SelectButton from "primevue/selectbutton";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import Checkbox from "primevue/checkbox";
import PickList from "primevue/picklist";
import ContextMenu from "primevue/contextmenu";
import { FilterMatchMode, FilterOperator } from "primevue/api";
import RadioButton from "primevue/radiobutton";
import ConfirmPopup from "primevue/confirmpopup";
import InputSwitch from "primevue/inputswitch";
import StyleClass from "primevue/styleclass";
import Tag from "primevue/tag";
import AutoComplete from "primevue/autocomplete";
import Breadcrumb from "primevue/breadcrumb";
import Sidebar from "primevue/sidebar";
import Chips from "primevue/chips";
import DataView from "primevue/dataview";
import Steps from "primevue/steps";
import Chip from "primevue/chip";
import ToggleButton from "primevue/togglebutton";
import Skeleton from "primevue/skeleton";
import DialogService from "primevue/dialogservice";
import DynamicDialog from "primevue/dynamicdialog";
import Image from "primevue/image";
import InputNumber from "primevue/inputnumber";
import Calendar from "primevue/calendar";
import TreeSelect from "primevue/treeselect";
import Inplace from "primevue/inplace";
import TieredMenu from "primevue/tieredmenu";
import TabMenu from "primevue/tabmenu";

import { Amplify, Auth } from "aws-amplify";
import awsconfig from "./aws-exports";
import { createPinia } from "pinia";
import { useSharedStore } from "@/stores/sharedStore";

Amplify.configure(awsconfig);
Auth.configure(awsconfig);

// msw initialising
if (import.meta.env.MODE === "mock") {
  worker.start();
}

const pinia = createPinia();

const app = createApp(App)
  .use(pinia)
  .use(router)
  .use(PrimeVue, { ripple: true, local: { dateFormat: "dd/mm/yyyy" } })
  .use(ConfirmationService)
  .use(ToastService)
  .use(DialogService)
  .use(VueClipboard, {
    autoSetContainer: true,
    appendToBody: true
  })
  .directive("tooltip", Tooltip)
  .directive("styleclass", StyleClass)
  .component("IMFontAwesomeIcon", IMFontAwesomeIcon)
  .component("Card", Card)
  .component("ProgressSpinner", ProgressSpinner)
  .component("TabView", TabView)
  .component("TabPanel", TabPanel)
  .component("InputText", InputText)
  .component("Tree", Tree)
  .component("Divider", Divider)
  .component("Button", Button)
  .component("Panel", Panel)
  .component("Accordion", Accordion)
  .component("AccordionTab", AccordionTab)
  .component("ScrollPanel", ScrollPanel)
  .component("Splitter", Splitter)
  .component("SplitterPanel", SplitterPanel)
  .component("Listbox", Listbox)
  .component("DataTable", DataTable)
  .component("Column", Column)
  .component("ColumnGroup", ColumnGroup)
  .component("OrganizationChart", OrganizationChart)
  .component("Textarea", Textarea)
  .component("Dropdown", Dropdown)
  .component("ConfirmDialog", ConfirmDialog)
  .component("Dialog", Dialog)
  .component("SplitButton", SplitButton)
  .component("MultiSelect", MultiSelect)
  .component("OverlayPanel", OverlayPanel)
  .component("Menu", Menu)
  .component("Chart", Chart)
  .component("Menubar", Menubar)
  .component("InlineMessage", InlineMessage)
  .component("Message", Message)
  .component("Avatar", Avatar)
  .component("MegaMenu", MegaMenu)
  .component("Timeline", Timeline)
  .component("SelectButton", SelectButton)
  .component("Toast", Toast)
  .component("Checkbox", Checkbox)
  .component("PickList", PickList)
  .component("FileUpload", FileUpload)
  .component("ContextMenu", ContextMenu)
  .component("FilterMatchMode", FilterMatchMode)
  .component("FilterOperator", FilterOperator)
  .component("RadioButton", RadioButton)
  .component("ConfirmPopup", ConfirmPopup)
  .component("InputSwitch", InputSwitch)
  .component("AutoComplete", AutoComplete)
  .component("Breadcrumb", Breadcrumb)
  .component("Sidebar", Sidebar)
  .component("Chips", Chips)
  .component("DataView", DataView)
  .component("Tag", Tag)
  .component("Steps", Steps)
  .component("Chip", Chip)
  .component("ToggleButton", ToggleButton)
  .component("Skeleton", Skeleton)
  .component("DynamicDialog", DynamicDialog)
  .component("Image", Image)
  .component("Calendar", Calendar)
  .component("InputNumber", InputNumber)
  .component("Inplace", Inplace)
  .component("TieredMenu", TieredMenu)
  .component("TreeSelect", TreeSelect)
  .component("TabMenu", TabMenu);

const sharedStore = useSharedStore();

// #v-ifdef VITE_FONT_AWESOME_PACKAGE_TOKEN
import addFontAwesomeProIcons from "./fontAwesomeProIcons/addFontAwesomeProIcons";
addFontAwesomeProIcons(library);
sharedStore.updateFontAwesomePro(true);
// #v-endif
// #v-ifndef VITE_FONT_AWESOME_PACKAGE_TOKEN
await import("@fortawesome/free-regular-svg-icons/index.js").then(module => library.add(module.far));
await import("@fortawesome/free-solid-svg-icons/index.js").then(module => library.add(module.fas));
sharedStore.updateFontAwesomePro(false);
// #v-endif

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
