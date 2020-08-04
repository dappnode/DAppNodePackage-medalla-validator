import { ValidatorSettings } from "../../common";
import * as db from "../db";

export async function getValidatorSettings(): Promise<ValidatorSettings> {
  return {
    validatorClient: db.server.validatorClient.get(),
    beaconProvider: db.server.beaconProvider.get()
  };
}
