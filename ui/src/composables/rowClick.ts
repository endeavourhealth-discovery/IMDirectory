import { DirectService } from "@/services";
import { ref, Ref } from "vue";

function rowClick() {
  const directService = new DirectService();
  const delay: Ref<number> = ref(200);
  const clicks: Ref<number> = ref(0);
  const timer: Ref<NodeJS.Timeout> = ref({} as NodeJS.Timeout);

  async function onRowClick(iri: string) {
    clicks.value++;
    if (clicks.value === 1) {
      timer.value = setTimeout(() => {
        directService.select(iri);
        clicks.value = 0;
      }, delay.value);
    } else {
      clearTimeout(timer.value);
      directService.view(iri);
      clicks.value = 0;
    }
  }
  return { onRowClick };
}

export default rowClick;
