import dargs from "dargs";
import { Supervisor } from "../utils/supervisor";
import {
  tlsCert,
  beaconRpcProvider,
  keymanagerFile,
  verbosity,
  logFile,
  graffiti,
  extraOpts
} from "../params";

const lighthouseDataDir = "/lighthouse";
const lighthouseSecretsDir = "/lighthouse/secrets";

export const prysmBinary = Supervisor(
  "validator",
  dargs({
    // "tls-cert": tlsCert,
    altona: true,
    "monitoring-host": "0.0.0.0",
    "beacon-rpc-provider": beaconRpcProvider,
    keymanager: "wallet",
    keymanageropts: keymanagerFile,
    verbosity: verbosity,
    "log-file": logFile,
    ...(graffiti ? { graffiti } : {}), // Ignore if empty
    _: [extraOpts]
  })
);

export const lighthouseBinary = Supervisor(
  "lighthouse validator_client",
  dargs({
    altona: true,
    "auto-register": true,
    "strict-lockfiles": true,
    datadir: lighthouseDataDir,
    "secrets-dir": lighthouseSecretsDir,
    server: beaconRpcProvider
  })
);
