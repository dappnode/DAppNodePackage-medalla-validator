import fetch from "node-fetch";
import { parseFetchJson } from "../utils/fetch";
import { DnpInstalledPackage } from "../../common";
import { PUBLIC_PACKAGES_APIURL } from "../params";

export async function getInstalledPackages(): Promise<DnpInstalledPackage[]> {
  const res = await fetch(PUBLIC_PACKAGES_APIURL);
  try {
    const data = await parseFetchJson(res);
    if (!Array.isArray(data)) throw Error(`Response data must be an array`);
    return data;
  } catch (e) {
    e.message = `DAppNode API not available: ${e.message}`;
    throw e;
  }
}
