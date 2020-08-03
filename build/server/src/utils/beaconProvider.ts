import { BeaconProvider } from "../../common";

export function getBeaconProviderUrl(beaconProvider: BeaconProvider): string {
  switch (beaconProvider) {
    case "lighthouse":
      return "http://beacon-chain-lighthouse.dappnode:4000";
    case "prysm":
      return "http://beacon-chain-prysm.dappnode:4000";
    default:
      return beaconProvider;
  }
}
