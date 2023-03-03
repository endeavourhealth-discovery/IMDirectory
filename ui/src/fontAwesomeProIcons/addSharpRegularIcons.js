export default async function addSharpRegularIcons(library) {
  // #v-ifdef VITE_FONT_AWESOME_PACKAGE_TOKEN
  await Promise.all([
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/sharp-regular-svg-icons/faLightbulbSlash").then(({ faLightbulbSlash }) => library.add(faLightbulbSlash))
  ]);
  // #v-endif
}
