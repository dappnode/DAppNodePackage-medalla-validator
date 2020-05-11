export const workdir = process.env.WORKDIR || "/app";
export const dataPath = process.env.DATA_PATH || "/app/data";
export const keymanagerWatchInterval = 2000;
export const tlsCert = workdir + "/ssl/ssl.crt";
export const logFile = "/var/log/validator.log";
export const extraOpts = process.env.EXTRA_OPTS || "";
export const verbosity = process.env.VERBOSITY || "info";
export const keymanagerFile = dataPath + "/keymanager.json";
export const beaconRpcProvider = "prysm-beacon-chain.public.dappnode:4000";

// Eth1 Deposit contract
export const depositContractAddress =
  "0x5cA1e00004366Ac85f492887AAab12d0e6418876";
export const depositContractCreationBlock = 2523557;
export const depositAmountEth = "32.0";
