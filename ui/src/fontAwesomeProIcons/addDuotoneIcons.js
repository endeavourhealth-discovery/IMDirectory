export default async function addDuotoneIcons(library) {
  // #v-ifdef VITE_FONT_AWESOME_PACKAGE_TOKEN
  await Promise.all([
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-duotone-svg-icons/faHouseChimney").then(({ faHouseChimney }) => library.add(faHouseChimney)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-duotone-svg-icons/faSliders").then(({ faSliders }) => library.add(faSliders)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-duotone-svg-icons/faListTree").then(({ faListTree }) => library.add(faListTree)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-duotone-svg-icons/faUpRightFromSquare").then(({ faUpRightFromSquare }) => library.add(faUpRightFromSquare)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-duotone-svg-icons/faPenToSquare").then(({ faPenToSquare }) => library.add(faPenToSquare)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-duotone-svg-icons/faArrowDownUpAcrossLine").then(({ faArrowDownUpAcrossLine }) =>
      library.add(faArrowDownUpAcrossLine)
    ),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-duotone-svg-icons/faUser").then(({ faUser }) => library.add(faUser)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-duotone-svg-icons/faFiles").then(({ faFiles }) => library.add(faFiles)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-duotone-svg-icons/faFileArrowDown").then(({ faFileArrowDown }) => library.add(faFileArrowDown)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-duotone-svg-icons/faFileArrowUp").then(({ faFileArrowUp }) => library.add(faFileArrowUp)),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-duotone-svg-icons/faCode").then(({ faCode }) => library.add(faCode))
  ]);
  // #v-endif
}
