export class ClipboardUtils {
    /**
     * Copy text ke clipboard.
     *
     * @param {string} text
     * @returns {Promise<void>}
     * @throws {Error} jika gagal atau tidak didukung
     */
    static async copyToClipboard(text) {
      if (!text) {
        throw new Error("ClipboardUtils.copyToClipboard: text is required");
      }
  
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error(
          "ClipboardUtils.copyToClipboard: Clipboard API not supported"
        );
      }
  
      await navigator.clipboard.writeText(text);
    }
  }