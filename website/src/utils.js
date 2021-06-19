export const setClipboard = (text) => { navigator.clipboard.writeText(text) }
export const byteCount = (s) => {
  return new Blob([s]).size
}