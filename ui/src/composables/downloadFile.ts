function setupDownloadFile(window: Window & typeof globalThis, document: Document) {
  const currentWindow = window;
  const currentDocument = document;

  function downloadFile(data: any, fileName: string) {
    const url = currentWindow.URL.createObjectURL(new Blob([data], { type: "application" }));
    const link = currentDocument.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  }
  return { downloadFile };
}

export default setupDownloadFile;
