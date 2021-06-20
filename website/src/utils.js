export const setClipboard = (text) => { navigator.clipboard.writeText(text) }
export const deepCopyObject = (object) => {
  return JSON.parse(JSON.stringify(object))
}
