import * as db from "../../db";
import { ValidatorClientName } from "../../../common";
import { Supervisor } from "../../utils/Supervisor";
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
  const client = db.server.validatorClient.get();
  return getValidatorBinary(client);
}

export function getValidatorBinary(client: ValidatorClientName): Supervisor {
  switch (client) {
    case "lighthouse":
      return lighthouseBinary;

    case "prysm":
      return prysmBinary;

    default:
      throw Error(`Unsupported client ${client}`);
  }
}
