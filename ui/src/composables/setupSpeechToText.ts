import { ref, Ref, onMounted } from "vue";

function setupSpeechToText(searchText: Ref<string>, searchPlaceholder: Ref<string>) {
  const listening = ref(false);
  const speech = ref(false);
  let recog: any = false;

  onMounted(() => {
    init();
  });

  function init() {
    const speechEngine = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (speechEngine) {
      recog = new speechEngine();
      recog.interimResults = true;
      recog.addEventListener("result", (ev: any) => {
        if (ev && ev.results && ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript) {
          const t = Array.from(ev.results)
            .map((r: any) => r[0])
            .map((r: any) => r.transcript)
            .join("");
          searchPlaceholder.value = t;
        }
      });
      recog.addEventListener("speechend", () => {
        searchText.value = searchPlaceholder.value;
        searchPlaceholder.value = "Search";
        listening.value = false;
      });
      speech.value = true;
    }
  }

  function toggleListen() {
    if (recog) {
      if (listening.value) {
        listening.value = false;
        recog.stop();
        searchPlaceholder.value = "Search";
      } else {
        searchText.value = "";
        recog.start();
        searchPlaceholder.value = "Listening...";
        listening.value = true;
      }
    }
  }

  return { listening, speech, recog, toggleListen };
}

export default setupSpeechToText;
