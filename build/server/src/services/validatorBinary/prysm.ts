import dargs from "dargs";
import { Supervisor } from "../../utils/Supervisor";
import {
  beaconRpcProvider,
  keymanagerFile,
  verbosity,
  logFile,
  graffiti,
  extraOpts
} from "../../params";
import { logs } from "../../logs";

export const prysmBinary = new Supervisor(
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
  }),
  {
    timeoutKill: 10 * 1000,
    restartWait: 1000,
    resolveStartOnData: true,
    log: data => logs.info("[prysm]", data)
  }
);
