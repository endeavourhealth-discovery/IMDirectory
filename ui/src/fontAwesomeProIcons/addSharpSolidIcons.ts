import {Library} from '@fortawesome/fontawesome-svg-core';

export default function addSharpSolidIcons(library: Library) {
  // #v-ifdef VITE_FONT_AWESOME_PACKAGE_TOKEN
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/sharp-solid-svg-icons/faLightbulbSlash").then(({ faLightbulbSlash }) => library.add(faLightbulbSlash));
  // #v-endif
}
