// @ts-nocheck
// #v-ifdef VITE_FONT_AWESOME_PACKAGE_TOKEN
import { Library } from "@fortawesome/fontawesome-svg-core";
import { faHouseChimney } from "@fortawesome/pro-duotone-svg-icons/faHouseChimney";
import { faSliders } from "@fortawesome/pro-duotone-svg-icons/faSliders";
import { faListTree } from "@fortawesome/pro-duotone-svg-icons/faListTree";
import { faUpRightFromSquare } from "@fortawesome/pro-duotone-svg-icons/faUpRightFromSquare";
import { faArrowDownUpAcrossLine } from "@fortawesome/pro-duotone-svg-icons/faArrowDownUpAcrossLine";
import { faUser } from "@fortawesome/pro-duotone-svg-icons/faUser";
import { faFiles } from "@fortawesome/pro-duotone-svg-icons/faFiles";
import { faFileArrowDown } from "@fortawesome/pro-duotone-svg-icons/faFileArrowDown";
import { faFileArrowUp } from "@fortawesome/pro-duotone-svg-icons/faFileArrowUp";
import { faCode } from "@fortawesome/pro-duotone-svg-icons/faCode";
import { faCookieBite } from "@fortawesome/pro-duotone-svg-icons/faCookieBite";
import { faDiagramProject } from "@fortawesome/pro-duotone-svg-icons/faDiagramProject";
import { faClipboardCheck } from "@fortawesome/pro-duotone-svg-icons/faClipboardCheck";
import { faPenToSquare } from "@fortawesome/pro-duotone-svg-icons/faPenToSquare";
import { faListCheck } from "@fortawesome/pro-duotone-svg-icons/faListCheck";
import { faFolder } from "@fortawesome/pro-duotone-svg-icons/faFolder";
import { faMagnifyingGlass } from "@fortawesome/pro-duotone-svg-icons/faMagnifyingGlass";
import { faFilterList } from "@fortawesome/pro-duotone-svg-icons/faFilterList";
import { faLightbulb } from "@fortawesome/pro-duotone-svg-icons/faLightbulb";

export default function addDuotoneIcons(library: Library) {
  library.add(
    faHouseChimney,
    faSliders,
    faListTree,
    faUpRightFromSquare,
    faPenToSquare,
    faArrowDownUpAcrossLine,
    faUser,
    faFiles,
    faFileArrowDown,
    faFileArrowUp,
    faCode,
    faCookieBite,
    faDiagramProject,
    faClipboardCheck,
    faListCheck,
    faFolder,
    faMagnifyingGlass,
    faFilterList,
    faLightbulb
  );
}
// #v-endif
