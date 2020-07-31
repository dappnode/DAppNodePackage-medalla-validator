import fetch from "node-fetch";
import querystring from "querystring";
import { beaconGrpcGatewayUrl } from "../params";
import { urlJoin } from "./url";

export function hexToBase64(s: string): string {
  return Buffer.from(s.replace("0x", ""), "hex").toString("base64");
}

export function base64ToHex(s: string): string {
  return "0x" + Buffer.from(s, "base64").toString("hex");
}

export async function fetchGrpc<R>(apiPath: string): Promise<R> {
  return fetchJson<R>(urlJoin(beaconGrpcGatewayUrl, apiPath));
}

export function qsPubKeys(pubKeys: string[]): string {
  return querystring.stringify({ publicKeys: pubKeys.map(hexToBase64) });
}

async function fetchJson<R>(url: string): Promise<R> {
  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok) throw Error(`${res.status} ${res.statusText}\n${body}`);
  try {
    return JSON.parse(body);
  } catch (e) {
    throw Error(`Error parsing request body: ${e.message}\n${body}`);
  }
}
