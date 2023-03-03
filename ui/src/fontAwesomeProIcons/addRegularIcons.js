export default async function addRegularIcons(library) {
  // #v-ifdef VITE_FONT_AWESOME_PACKAGE_TOKEN
  await Promise.all([
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-regular-svg-icons/faXmark").then(({ faXmark }) => library.add(faXmark)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-regular-svg-icons/faAngleLeft").then(({ faAngleLeft }) => library.add(faAngleLeft)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-regular-svg-icons/faAngleRight").then(({ faAngleRight }) => library.add(faAngleRight)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-regular-svg-icons/faStar").then(({ faStar }) => library.add(faStar)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-regular-svg-icons/faGrid2").then(({ faGrid2 }) => library.add(faGrid2)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-regular-svg-icons/faUser").then(({ faUser }) => library.add(faUser))
  ]);
  // #v-endif
}
