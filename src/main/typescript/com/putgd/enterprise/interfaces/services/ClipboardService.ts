export interface ClipboardService {
  writeTextToClipboard(textToWrite: string): Promise<void>;
}
