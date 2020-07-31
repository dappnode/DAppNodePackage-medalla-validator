import dargs from "dargs";
import { Supervisor } from "../../utils/Supervisor";
import {
  beaconRpcProvider,
  LIGHTHOUSE_SECRETS_DIR,
  LIGHTHOUSE_DATA_DIR
} from "../../params";
import { logs } from "../../logs";

export const lighthouseBinary = new Supervisor(
  "lighthouse",
  [
    "validator_client",
    ...dargs({
      altona: true,
      "auto-register": true,
      "strict-lockfiles": true,
      datadir: LIGHTHOUSE_DATA_DIR,
      "secrets-dir": LIGHTHOUSE_SECRETS_DIR,
      server: beaconRpcProvider
    })
  ],
  {
    timeoutKill: 10 * 1000,
    restartWait: 1000,
    resolveStartOnData: true,
    log: (data): void => logs.info("[lighthouse]", data)
  }
);
