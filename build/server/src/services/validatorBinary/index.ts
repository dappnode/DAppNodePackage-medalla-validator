import { server } from "../../db";
import { Supervisor } from "../../utils/Supervisor";
import { Eth2ClientName } from "../../../common";
import { lighthouseBinary } from "./lighthouse";
import { prysmBinary } from "./prysm";

/**
 * Start `client` binary
 */
export async function startValidatorBinary(): Promise<void> {
  const validatorBinary = getCurrentValidatorBinary();
  await validatorBinary.start();
}

export function getCurrentValidatorBinary(): Supervisor {
  const client = server.validatorClient.get();
  return getValidatorBinary(client);
}

export function getValidatorBinary(client: Eth2ClientName): Supervisor {
  switch (client) {
    case "lighthouse":
      return lighthouseBinary;

    case "prysm":
      return prysmBinary;

    default:
      throw Error(`Unsupported client ${client}`);
  }
}
