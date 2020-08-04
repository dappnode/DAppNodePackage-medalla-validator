import { BeaconProviderName } from "../../common";
import { LIGHTHOUSE_VALIDATOR_APIURL, PRYSM_VALIDATOR_APIRUL } from "../params";

export function getBeaconProviderUrl(
  beaconProvider: BeaconProviderName
): string {
  switch (beaconProvider) {
    case "lighthouse":
      return LIGHTHOUSE_VALIDATOR_APIURL;
    case "prysm":
      return PRYSM_VALIDATOR_APIRUL;
    default:
      throw Error(`Not supported beacon provider ${beaconProvider}`);
  }
}
