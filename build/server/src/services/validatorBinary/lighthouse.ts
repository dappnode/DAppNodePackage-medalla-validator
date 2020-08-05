import { Supervisor } from "../../utils/Supervisor";
import {
  LIGHTHOUSE_SECRETS_DIR,
  LIGHTHOUSE_DATA_DIR,
  LIGHTHOUSE_VERBOSITY,
  LIGHTHOUSE_EXTRA_OPTS
} from "../../params";
import { getLogger } from "../../logs";
import { getBeaconProviderUrl } from "./utils";

export const lighthouseBinary = new Supervisor(
  {
    command: "lighthouse",
    args: ["validator_client"],
    options: {
      "auto-register": true,
      // "strict-lockfiles": true,
      "debug-level": LIGHTHOUSE_VERBOSITY,
      datadir: LIGHTHOUSE_DATA_DIR,
      "secrets-dir": LIGHTHOUSE_SECRETS_DIR,
      server: getBeaconProviderUrl(),
      // dargs extra options
      _: [LIGHTHOUSE_EXTRA_OPTS]
    },
    dynamicOptions: () => ({
      server: getBeaconProviderUrl()
    })
  },
  {
    timeoutKill: 10 * 1000,
    restartWait: 1000,
    resolveStartOnData: true,
    logger: getLogger({ location: "lighthouse" })
  }
);
