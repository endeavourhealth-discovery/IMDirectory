import { createApp, Plugin, ComponentPublicInstance } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import PrimeVue from "primevue/config";
import VueClipboard from "vue3-clipboard";
import { worker } from "./mocks/browser";

// Font Awesome
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";

library.add(fab);

try {
  const duotone = "pro-duotone-svg-icons";
  const light = "pro-light-svg-icons";
  const regular = "pro-regular-svg-icons";
  const solid = "pro-solid-svg-icons";
  const thin = "pro-thin-svg-icons";
  const sharpRegular = "sharp-regular-svg-icons";
  const sharpSolid = "sharp-solid-svg-icons";
  await Promise.all([
    import(/*@vite-ignore */ `../node_modules/@fortawesome/${duotone}`).then(module => library.add(module.fad)),
    import(/*@vite-ignore */ `../node_modules/@fortawesome/${light}`).then(module => library.add(module.fal)),
    import(/*@vite-ignore */ `../node_modules/@fortawesome/${regular}`).then(module => library.add(module.far)),
    import(/*@vite-ignore */ `../node_modules/@fortawesome/${solid}`).then(module => library.add(module.fas)),
    import(/*@vite-ignore */ `../node_modules/@fortawesome/${thin}`).then(module => library.add(module.fat)),
    import(/*@vite-ignore */ `../node_modules/@fortawesome/${sharpRegular}`).then(module => library.add(module.fasr)),
    import(/*@vite-ignore */ `../node_modules/@fortawesome/${sharpSolid}`).then(module => library.add(module.fass))
  ]);
  store.commit("updateFontAwesomePro", true);
} catch (err) {
  await Promise.all([
    import("@fortawesome/free-regular-svg-icons").then(module => library.add(module.far)),
    import("@fortawesome/free-solid-svg-icons").then(module => library.add(module.fas))
  ]);
  store.commit("updateFontAwesomePro", false);
}
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";

dom.watch();

import "primevue/resources/themes/saga-blue/theme.css"; //theme

import "primevue/resources/primevue.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css";
import "./assets/layout/layout.scss";
import "./assets/layout/flags/flags.css";

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

import { Amplify, Auth } from "aws-amplify";
import awsconfig from "./aws-exports";
import "sweetalert2/dist/sweetalert2.min.css";

Amplify.configure(awsconfig);
Auth.configure(awsconfig);

// msw initialising
if (import.meta.env.MODE === "mock") {
  worker.start();
}

const app = createApp(App)
  .use(store)
  .use(router)
  .use(PrimeVue, { ripple: true })
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
  .component("DynamicDialog", DynamicDialog);
const vm = app.mount("#app");

// Vue application exceptions
app.config.errorHandler = (err: unknown, _instance: ComponentPublicInstance | null, info: string) => {
  console.error(err);
  _instance?.$toast.add({
    severity: "error",
    summary: info,
    detail: err
  });
};
