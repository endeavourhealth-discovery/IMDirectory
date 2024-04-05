import { Ref, ref } from "vue";

function setupHover() {
  const hover: Ref<boolean> = ref(false);

  function mouseover(event: Event) {
    event.stopPropagation();
    hover.value = true;
  }

  function mouseout(event: Event) {
    event.stopPropagation();
    hover.value = false;
  }

  return {
    hover,
    mouseover,
    mouseout
  };
}

export default setupHover;
