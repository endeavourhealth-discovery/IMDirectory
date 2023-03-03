export default async function addLightIcons(library) {
  // #v-ifdef VITE_FONT_AWESOME_PACKAGE_TOKEN
  await Promise.all([
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-light-svg-icons/faLightbulbSlash").then(({ faLightbulbSlash }) => library.add(faLightbulbSlash))
  ]);
  // #v-endif
}
