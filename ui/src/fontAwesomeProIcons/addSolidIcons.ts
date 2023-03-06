import {Library} from '@fortawesome/fontawesome-svg-core';

export default function addSolidIcons(library: Library) {
  // #v-ifdef VITE_FONT_AWESOME_PACKAGE_TOKEN
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faDiagramProject").then(({ faDiagramProject }) => library.add(faDiagramProject));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faClipboardCheck").then(({ faClipboardCheck }) => library.add(faClipboardCheck));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faPenToSquare").then(({ faPenToSquare }) => library.add(faPenToSquare));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faListCheck").then(({ faListCheck }) => library.add(faListCheck));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faFolder").then(({ faFolder }) => library.add(faFolder));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faMagnifyingGlass").then(({ faMagnifyingGlass }) => library.add(faMagnifyingGlass));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faKey").then(({ faKey }) => library.add(faKey));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faUser").then(({ faUser }) => library.add(faUser));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faUsers").then(({ faUsers }) => library.add(faUsers));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faArrowRightFromBracket").then(({ faArrowRightFromBracket }) =>
      library.add(faArrowRightFromBracket)
    ),
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faCopy").then(({ faCopy }) => library.add(faCopy));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faCheck").then(({ faCheck }) => library.add(faCheck));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faStar").then(({ faStar }) => library.add(faStar));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faSitemap").then(({ faSitemap }) => library.add(faSitemap));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faMinus").then(({ faMinus }) => library.add(faMinus));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faPlus").then(({ faPlus }) => library.add(faPlus));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faGripVertical").then(({ faGripVertical }) => library.add(faGripVertical));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faBolt").then(({ faBolt }) => library.add(faBolt));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faUpRightFromSquare").then(({ faUpRightFromSquare }) => library.add(faUpRightFromSquare));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faUserPlus").then(({ faUserPlus }) => library.add(faUserPlus));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faUserPen").then(({ faUserPen }) => library.add(faUserPen));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faUserLock").then(({ faUserLock }) => library.add(faUserLock));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faArrowRightFromBracket").then(({ faArrowRightFromBracket }) => library.add(faArrowRightFromBracket));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faCloudArrowDown").then(({ faCloudArrowDown }) => library.add(faCloudArrowDown));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faFile").then(({ faFile }) => library.add(faFile));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faFileArrowUp").then(({ faFileArrowUp }) => library.add(faFileArrowUp));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faFileArrowDown").then(({ faFileArrowDown }) => library.add(faFileArrowDown));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faCode").then(({ faCode }) => library.add(faCode));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faFolderOpen").then(({ faFolderOpen }) => library.add(faFolderOpen));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faCirclePlus").then(({ faCirclePlus }) => library.add(faCirclePlus));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faBan").then(({ faBan }) => library.add(faBan));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faArrowLeft").then(({ faArrowLeft }) => library.add(faArrowLeft));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faHome").then(({ faHome }) => library.add(faHome));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faBoltLightning").then(({ faBoltLightning }) => library.add(faBoltLightning));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faRobot").then(({ faRobot }) => library.add(faRobot));
    /*@ts-ignore*/
    import(/*@vite-ignore*/ "@fortawesome/pro-solid-svg-icons/faLightbulb").then(({ faLightbulb }) => library.add(faLightbulb))
  // #v-endif
}
