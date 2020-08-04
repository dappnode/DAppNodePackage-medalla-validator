import { PUBLIC_PACKAGES_APIURL } from "params";
import useSWR from "swr";

interface InstalledPackage {
  ip: string; // "172.33.1.5"; "" if not set
  name: string; // "ipfs.dnp.dappnode.eth";
  state: "running" | "exited"; // or other docker status
  version: string; // "0.2.10";
}

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
