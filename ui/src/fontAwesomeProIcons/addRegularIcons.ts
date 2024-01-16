// @ts-nocheck
// #v-ifdef VITE_FONT_AWESOME_PACKAGE_TOKEN
import { Library } from "@fortawesome/fontawesome-svg-core";

import { faXmark } from "@fortawesome/pro-regular-svg-icons/faXmark";
import { faAngleLeft } from "@fortawesome/pro-regular-svg-icons/faAngleLeft";
import { faAngleRight } from "@fortawesome/pro-regular-svg-icons/faAngleRight";
import { faStar } from "@fortawesome/pro-regular-svg-icons/faStar";
import { faGrid2 } from "@fortawesome/pro-regular-svg-icons/faGrid2";
import { faUser } from "@fortawesome/pro-regular-svg-icons/faUser";
import { faPalette } from "@fortawesome/pro-regular-svg-icons/faPalette";
import { faCircleXmark } from "@fortawesome/pro-regular-svg-icons/faCircleXmark";
import { faCircleCheck } from "@fortawesome/pro-regular-svg-icons/faCircleCheck";
import { faArrowRight } from "@fortawesome/pro-regular-svg-icons/faArrowRight";
import { faAddressBook } from "@fortawesome/pro-regular-svg-icons/faAddressBook";
import { faTrashCan } from "@fortawesome/pro-regular-svg-icons/faTrashCan";

export default function addRegularIcons(library: Library) {
  library.add(faXmark, faAngleLeft, faAngleRight, faStar, faGrid2, faUser, faPalette, faCircleXmark, faCircleCheck, faArrowRight, faAddressBook, faTrashCan);
}
// #v-endif
