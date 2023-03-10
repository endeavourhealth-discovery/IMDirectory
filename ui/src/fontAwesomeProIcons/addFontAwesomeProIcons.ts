import addDuotoneIcons from "./addDuotoneIcons";
import addRegularIcons from "./addRegularIcons";
import addSolidIcons from "./addSolidIcons";
import {Library} from '@fortawesome/fontawesome-svg-core';

console.log("Add FAPro")
export default function addFontAwesomeProIcons(library: Library) {
    addDuotoneIcons(library);
    addRegularIcons(library);
    addSolidIcons(library);
}
