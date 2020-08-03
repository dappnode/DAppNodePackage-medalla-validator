import { BeaconProvider } from "../../common";
import { getValidatorBinary } from "../services/validatorBinary";
import { server } from "../db";

/**
 * Set beacon provider URL or name to which validator clients connect to
 */
export async function setBeaconProvider(
  beaconProvider: BeaconProvider
): Promise<void> {
  const prevBeaconProvider = server.beaconProvider.get();
  if (prevBeaconProvider === beaconProvider) return;

  server.beaconProvider.set(beaconProvider);

  const client = server.validatorClient.get();
  const binary = getValidatorBinary(client);
  await binary.restart();
}
