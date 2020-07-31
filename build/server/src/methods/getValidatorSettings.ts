import { ValidatorSettings } from "../../common";
import { server } from "../db";

export async function getValidatorSettings(): Promise<ValidatorSettings> {
  return {
    validatorClient: server.validatorClient.get(),
    beaconProvider: server.beaconProvider.get()
  };
}
