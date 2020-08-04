import fetch from "node-fetch";
import { DnpInstalledPackage } from "../../common";
import { PUBLIC_PACKAGES_APIURL } from "../params";

export async function getInstalledPackages(): Promise<DnpInstalledPackage[]> {
  return fetch(PUBLIC_PACKAGES_APIURL).then(res => res.json());
}
