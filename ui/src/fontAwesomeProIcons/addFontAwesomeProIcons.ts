import store from "@/store";
import addDuotoneIcons from "./addDuotoneIcons";
import addLightIcons from "./addLightIcons";
import addRegularIcons from "./addRegularIcons";
import addSharpRegularIcons from "./addSharpRegularIcons";
import addSharpSolidIcons from "./addSharpSolidIcons";
import addSolidIcons from "./addSolidIcons";
import addThinIcons from "./addThinIcons";
import {Library} from '@fortawesome/fontawesome-svg-core';

export default function addFontAwesomeProIcons(library: Library) {
    addDuotoneIcons(library);
    addLightIcons(library);
    addRegularIcons(library);
    addSolidIcons(library);
    addThinIcons(library);
    addSharpRegularIcons(library);
    addSharpSolidIcons(library);
}
