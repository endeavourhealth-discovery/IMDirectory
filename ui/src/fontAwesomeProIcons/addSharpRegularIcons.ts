import {Library} from '@fortawesome/fontawesome-svg-core';

2
export default function addSharpRegularIcons(library: Library) {
  // #v-ifdef VITE_FONT_AWESOME_PACKAGE_TOKEN
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/sharp-regular-svg-icons/faLightbulbSlash").then(({ faLightbulbSlash }) => library.add(faLightbulbSlash));
  // #v-endif
}
