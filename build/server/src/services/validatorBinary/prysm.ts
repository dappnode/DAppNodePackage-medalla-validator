import { Supervisor } from "../../utils/Supervisor";
import {
  verbosity,
  logFile,
  graffiti,
  extraOpts,
  PRYSM_WALLET_DIR
} from "../../params";
import { getLogger } from "../../logs";
import * as db from "../../db";
import { getBeaconProviderUrl } from "../../utils/beaconProvider";

export const prysmBinary = new Supervisor(
  {
    command: "validator",
    options: {
      medalla: true,
      "monitoring-host": "0.0.0.0",
      "beacon-rpc-provider": getBeaconProviderUrl(
        db.server.beaconProvider.get()
      ),
      "wallet-dir": PRYSM_WALLET_DIR,
      verbosity: verbosity,
      "log-file": logFile,
      ...(graffiti ? { graffiti } : {}), // Ignore if empty
      // dargs extra options
      _: [extraOpts]
    },
    dynamicOptions: () => ({
      "beacon-rpc-provider": getBeaconProviderUrl(
        db.server.beaconProvider.get()
      )
    })
  },
  {
    timeoutKill: 10 * 1000,
    restartWait: 1000,
    resolveStartOnData: true,
    logger: getLogger({ location: "prysm" })
  }
);
