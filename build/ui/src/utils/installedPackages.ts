import { PUBLIC_PACKAGES_APIURL } from "params";
import useSWR from "swr";
import { InstalledPackage } from "types";

export async function getInstalledPackages(): Promise<InstalledPackage[]> {
  return fetch(PUBLIC_PACKAGES_APIURL).then((res) => res.json());
}

export function useInstalledPackages() {
  return useSWR<InstalledPackage[], Error>(
    PUBLIC_PACKAGES_APIURL,
    () => fetch(PUBLIC_PACKAGES_APIURL).then((res) => res.json()),
    {
      refreshInterval: 5000,
      dedupingInterval: 5000,
    }
  );
}
