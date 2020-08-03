import { Supervisor } from "../../utils/Supervisor";
import {
  keymanagerFile,
  verbosity,
  logFile,
  graffiti,
  extraOpts
} from "../../params";
import { logs } from "../../logs";
import { server } from "../../db";
import { getBeaconProviderUrl } from "../../utils/beaconProvider";

export const prysmBinary = new Supervisor(
  {
    command: "validator",
    options: {
      altona: true,
      "monitoring-host": "0.0.0.0",
      "beacon-rpc-provider": getBeaconProviderUrl(server.beaconProvider.get()),
      keymanager: "wallet",
      keymanageropts: keymanagerFile,
      verbosity: verbosity,
      "log-file": logFile,
      ...(graffiti ? { graffiti } : {}), // Ignore if empty
      // dargs extra options
      _: [extraOpts]
    },
    dynamicOptions: () => ({
      "beacon-rpc-provider": getBeaconProviderUrl(server.beaconProvider.get())
    })
  },
  {
    timeoutKill: 10 * 1000,
    restartWait: 1000,
    resolveStartOnData: true,
    log: (data): void => logs.info("[prysm]", data)
  }
);
