/**
 * Util: Given ["1", "3"] return the first available number: "2"
 * @param arr
 */
export function findFirstAvailableNum(arr: string[]): string {
  for (let i = 0; i <= arr.length; i++) {
    const name = String(i + 1);
    if (!arr.includes(name)) return name;
  }
  return String(Math.random()).slice(2); // It's just a label ID
}

// Props to be passed to a JSX <a> element to open a new tab
// The purpose of this utility is to centralize this props.
// To disable the newTab openning for certain <a> from the whole project, edit this file
//
// It converts:
//   <a href={url} rel="noopener noreferrer" target="_blank">
// Into:
//   <a href={url} {...newTabProps}>

export const newTabProps = { rel: "noopener noreferrer", target: "_blank" };
