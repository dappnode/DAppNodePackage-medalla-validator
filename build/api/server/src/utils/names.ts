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
