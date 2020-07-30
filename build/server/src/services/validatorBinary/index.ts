import { server } from "../../db";
import { Supervisor } from "../../utils/Supervisor";
import { Eth2ClientName } from "../../../common";
import { lighthouseBinary } from "./lighthouse";
import { prysmBinary } from "./prysm";

/**
 * Kills `prevClient` running binary ensuring it has exited.
 * Then, it start the `nextClient` binary resolving when data is emitted
 */
export async function switchValidatorBinary(nextClient: Eth2ClientName) {
  const prevClient = server.validatorClient.get();
  if (prevClient === nextClient) return;

  await getValidatorBinary(prevClient).kill();
  await getValidatorBinary(nextClient).start();
}

/**
 * Start `client` binary
 */
export async function startValidatorBinary() {
  const validatorBinary = getCurrentValidatorBinary();
  await validatorBinary.start();
}

export function getCurrentValidatorBinary(): Supervisor {
  const client = server.validatorClient.get();
  return getValidatorBinary(client);
}

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
