import { Supervisor } from "../../utils/Supervisor";
import {
  GRAFFITI,
  PRYSM_VERBOSITY,
  PRYSM_EXTRA_OPTS,
  PRYSM_LOG_FILE,
  PRYSM_DATA_DIR,
  PRYSM_WALLET_DIR,
  PRYSM_SECRETS_DIR
} from "../../params";
import { getLogger } from "../../logs";
import { getBeaconProviderUrlPrysm } from "./utils";

export const prysmBinary = new Supervisor(
  {
    command: "validator",
    options: {
      medalla: true,
      "monitoring-host": "0.0.0.0",
      "beacon-rpc-provider": getBeaconProviderUrlPrysm(),
      datadir: PRYSM_DATA_DIR,
      "wallet-dir": PRYSM_WALLET_DIR,
      "passwords-dir": PRYSM_SECRETS_DIR,
      "disable-accounts-v2": true,
      verbosity: PRYSM_VERBOSITY,
      "log-file": PRYSM_LOG_FILE,
      ...(GRAFFITI ? { graffiti: GRAFFITI } : {}), // Ignore if empty
      // dargs extra options
      _: [PRYSM_EXTRA_OPTS]
    },
    dynamicOptions: () => ({
      "beacon-rpc-provider": getBeaconProviderUrlPrysm()
    })
  },
  {
    timeoutKill: 10 * 1000,
    restartWait: 1000,
    resolveStartOnData: true,
    logger: getLogger({ location: "prysm" })
  }
);
