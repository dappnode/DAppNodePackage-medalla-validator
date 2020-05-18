import dargs from "dargs";
import { Supervisor } from "../utils/supervisor";
import {
  tlsCert,
  beaconRpcProvider,
  keymanagerFile,
  verbosity,
  logFile,
  extraOpts
} from "../params";

export const validatorBinary = Supervisor(
  "validator",
  dargs({
    // "tls-cert": tlsCert,
    "beacon-rpc-provider": beaconRpcProvider,
    keymanager: "wallet",
    keymanageropts: keymanagerFile,
    verbosity: verbosity,
    "log-file": logFile,
    _: [extraOpts]
  })
);
