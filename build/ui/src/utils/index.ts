import { DepositEvent } from "common";

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

/**
 * Joins multiple url parts safely
 * - Does not break the protocol double slash //
 * - Cleans double slashes at any point
 * @param args ("http://ipfs.io", "ipfs", "Qm")
 * @return "http://ipfs.io/ipfs/Qm"
 */
export function urlJoin(...args: string[]): string {
  return (
    args
      .join("/")
      .replace(/([^:]\/)\/+/g, "$1")
      // Duplicate slashes in the front
      .replace(/^(\/)+/, "/")
  );
}

/**
 * Format an ETH value to a reasonable amount of decimal places
 * @param value
 */
export function formatEth(
  value: string | number | null,
  fractionDigits = 3
): number | string {
  if (value === null) return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return value;
  return +num.toFixed(fractionDigits);
}

const amount32Eth = "0x0040597307000000";

/**
 * Fetches the highest amount from various deposit events
 * @param depositEvents
 */
export function getEstimatedBalanceFormDepositEvents(depositEvents: {
  [transactionHashAndLogIndex: string]: DepositEvent;
}): number | undefined {
  const events = Object.values(depositEvents);
  const estimatedBalances = events.map((event) => {
    try {
      return parseDepositAmount(event.amount);
    } catch (e) {
      console.error(`Error parsing deposit amount`, e);
      return event.amount === amount32Eth ? 32 : 0;
    }
  });
  return estimatedBalances.length ? Math.max(...estimatedBalances) : undefined;
}

function parseDepositAmount(amount: string): number {
  return parseInt("0x" + changeEndianness(amount.replace("0x", ""))) / 1e9;
}

function changeEndianness(string: string) {
  const result = [];
  let len = string.length - 2;
  while (len >= 0) {
    result.push(string.substr(len, 2));
    len -= 2;
  }
  return result.join("");
}
