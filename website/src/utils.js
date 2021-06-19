export const setClipboard = (text) => { navigator.clipboard.writeText(text) }
export const byteCount = (s) => {
  return encodeURI(s).split(/%..|./).length - 1;
}