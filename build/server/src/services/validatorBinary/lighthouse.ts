import { Supervisor } from "../../utils/Supervisor";
import { LIGHTHOUSE_SECRETS_DIR, LIGHTHOUSE_DATA_DIR } from "../../params";
import { getLogger } from "../../logs";
import { server } from "../../db";
import { getBeaconProviderUrl } from "../../utils/beaconProvider";

export const lighthouseBinary = new Supervisor(
  {
    command: "lighthouse",
    args: ["validator_client"],
    options: {
      "auto-register": true,
      "strict-lockfiles": true,
      datadir: LIGHTHOUSE_DATA_DIR,
      "secrets-dir": LIGHTHOUSE_SECRETS_DIR,
      server: getBeaconProviderUrl(server.beaconProvider.get())
    },
    dynamicOptions: () => ({
      server: getBeaconProviderUrl(server.beaconProvider.get())
    })
  },
  {
    timeoutKill: 10 * 1000,
    restartWait: 1000,
    resolveStartOnData: true,
    logger: getLogger({ location: "lighthouse" })
  }
);
