import { Supervisor } from "../../utils/Supervisor";
import { Eth2ClientName } from "../../../common";
import { lighthouseBinary } from "./lighthouse";
import { prysmBinary } from "./prysm";

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
 * Kills `prevClient` running binary ensuring it has exited.
 * Then, it start the `nextClient` binary resolving when data is emitted
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
