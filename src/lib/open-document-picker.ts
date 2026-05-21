import { DOCUMENT_ACCEPT } from "@/lib/validate-document-file";

export function openDocumentPicker(onFile: (file: File) => void): void {
  const el = document.createElement("input");
  el.type = "file";
  el.accept = DOCUMENT_ACCEPT;
  el.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) onFile(file);
  };
  el.click();
}
