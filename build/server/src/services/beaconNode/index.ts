import { BeaconProviderName } from "../../../common";
import { BeaconNodeClient } from "./interface";
import { LighthouseNodeClient } from "./lighthouse";
import { PrysmBeaconNodeClient } from "./prysm";
import { LIGHTHOUSE_REST_APIURL, PRYSM_REST_APIURL } from "../../params";
export * from "./interface";

const lighthouseNodeClient = new LighthouseNodeClient(LIGHTHOUSE_REST_APIURL);
const prysmBeaconNodeClient = new PrysmBeaconNodeClient(PRYSM_REST_APIURL);

export function getBeaconNodeClient(
  beaconNode: BeaconProviderName
): BeaconNodeClient {
  switch (beaconNode) {
    case "lighthouse":
      return lighthouseNodeClient;

    case "prysm":
      return prysmBeaconNodeClient;

    default:
      throw Error(`Unsupported beaconNode ${beaconNode}`);
  }
}
