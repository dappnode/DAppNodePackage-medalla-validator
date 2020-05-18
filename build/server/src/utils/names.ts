/**
 * Util: Given ["1", "3"] return the first N available numbers: ["2", "4"]
 * @param arr
 */
export function findNAvailableNums(arr: string[], count: number): string[] {
  const hasItem = arrToObject(arr);
  const res: string[] = [];
  for (let i = 0; i <= arr.length + count; i++) {
    const name = String(i + 1);
    if (!hasItem[name]) {
      res.push(name);
      if (res.length >= count) break;
    }
  }
  // Make sure length is correct if something goes wrong
  if (res.length < count)
    throw Error(
      `Generated array of nums does not have length ${count}: ${JSON.stringify(
        res
      )}`
    );
  return res.slice(0, count);
}

/**
 * Util: Given ["1", "3"] return the first available number: "2"
 * @param arr
 */
export function findFirstAvailableNum(arr: string[]): string {
  return findNAvailableNums(arr, 1)[0];
}

/**
 * Convert array to object for fast lookup
 * @param arr
 */
function arrToObject(arr: string[]): { [key: string]: true } {
  return arr.reduce(
    (a, b) => ((a[b] = true), a),
    {} as { [name: string]: true }
  );
}
