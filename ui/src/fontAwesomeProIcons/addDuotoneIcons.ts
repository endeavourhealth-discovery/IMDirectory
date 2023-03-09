// @ts-nocheck
import {Library} from '@fortawesome/fontawesome-svg-core';
import { faHouseChimney } from "@fortawesome/pro-duotone-svg-icons/faHouseChimney";
import { faSliders } from "@fortawesome/pro-duotone-svg-icons/faSliders";
import { faListTree } from "@fortawesome/pro-duotone-svg-icons/faListTree";
import { faUpRightFromSquare} from '@fortawesome/pro-duotone-svg-icons/faUpRightFromSquare';
import { faPenToSquare } from "@fortawesome/pro-duotone-svg-icons/faPenToSquare";
import { faArrowDownUpAcrossLine } from "@fortawesome/pro-duotone-svg-icons/faArrowDownUpAcrossLine";
import { faUser } from "@fortawesome/pro-duotone-svg-icons/faUser";
import { faFiles } from "@fortawesome/pro-duotone-svg-icons/faFiles";
import { faFileArrowDown } from "@fortawesome/pro-duotone-svg-icons/faFileArrowDown";
import { faFileArrowUp } from "@fortawesome/pro-duotone-svg-icons/faFileArrowUp";
import { faCode } from "@fortawesome/pro-duotone-svg-icons/faCode";

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
    faCode
  );
}
