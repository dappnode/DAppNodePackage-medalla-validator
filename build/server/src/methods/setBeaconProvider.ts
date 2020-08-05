import { BeaconProviderName } from "../../common";
import { getValidatorBinary } from "../services/validatorBinary";
import * as db from "../db";

/**
 * Set beacon provider URL or name to which validator clients connect to
 */
export async function setBeaconProvider(
  beaconProvider: BeaconProviderName
): Promise<void> {
  const prevBeaconProvider = db.server.beaconProvider.get();
  if (prevBeaconProvider === beaconProvider) return;

  db.server.beaconProvider.set(beaconProvider);

  const client = db.server.validatorClient.get();
  if (client) {
    const binary = getValidatorBinary(client);
    await binary.restart();
  }
}
