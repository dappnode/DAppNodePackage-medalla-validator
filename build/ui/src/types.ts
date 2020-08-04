export interface RequestStatus<R = unknown> {
  result?: R;
  loading?: boolean;
  error?: string | Error;
}

export interface InstalledPackage {
  ip: string; // "172.33.1.5"; "" if not set
  name: string; // "ipfs.dnp.dappnode.eth";
  state: "running" | "exited"; // or other docker status
  version: string; // "0.2.10";
}
