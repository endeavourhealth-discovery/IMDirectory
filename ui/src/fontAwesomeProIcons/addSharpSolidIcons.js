export default async function addSharpSolidIcons(library) {
  // #v-ifdef VITE_FONT_AWESOME_PACKAGE_TOKEN
  await Promise.all([
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/sharp-solid-svg-icons/faLightbulbSlash").then(({ faLightbulbSlash }) => library.add(faLightbulbSlash))
  ]);
  // #v-endif
}
