import dargs from "dargs";
import { Supervisor } from "../utils/Supervisor";
import { Eth2ClientName } from "../../common";
import {
  tlsCert,
  beaconRpcProvider,
  keymanagerFile,
  verbosity,
  logFile,
  graffiti,
  extraOpts,
  LIGHTHOUSE_SECRETS_DIR,
  LIGHTHOUSE_DATA_DIR
} from "../params";

const lighthouseBinary = new Supervisor("lighthouse", [
  "validator_client",
  ...dargs({
    altona: true,
    "auto-register": true,
    "strict-lockfiles": true,
    datadir: LIGHTHOUSE_DATA_DIR,
    "secrets-dir": LIGHTHOUSE_SECRETS_DIR,
    server: beaconRpcProvider
  })
]);

const prysmBinary = new Supervisor(
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

function getValidatorBinary(client: Eth2ClientName): Supervisor {
  switch (client) {
    case "lighthouse":
      return lighthouseBinary;

    case "prysm":
      return prysmBinary;

    default:
      throw Error(`Unsupported client ${client}`);
  }
}

/**
 * Kill `prevClient` binary (which should be running), and start `nextClient` binary
 */
export async function switchValidatorBinary(
  prevClient: Eth2ClientName,
  nextClient: Eth2ClientName
) {
  if (prevClient === nextClient)
    throw Error(`prevClient and nextClient are the same: ${nextClient}`);

  await getValidatorBinary(prevClient).kill();
  await getValidatorBinary(nextClient).start();
}

/**
 * Start `client` binary
 */
export async function startValidatorBinary(client: Eth2ClientName) {
  await getValidatorBinary(client).start();
}
