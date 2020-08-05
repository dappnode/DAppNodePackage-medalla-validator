import memoizee from "memoizee";
import { NodeStats, BeaconProviderName } from "../../common";
import { ETH2_NETWORK_NAME } from "../params";
import * as db from "../db";
import { getBeaconNodeClient } from "../services/beaconNode";

async function getNodeStats(
  beaconNode: BeaconProviderName
): Promise<NodeStats> {
  const beaconNodeClient = getBeaconNodeClient(beaconNode);
  return {
    chainhead: await beaconNodeClient.chainhead(),
    syncing: await beaconNodeClient.syncing(),
    peers: await beaconNodeClient.peers(),
    eth2NetworkName: ETH2_NETWORK_NAME
  };
}

const getNodeStatsMem = memoizee(getNodeStats, {
  maxAge: 12 * 1000,
  promise: true
});

export async function nodeStats(): Promise<NodeStats> {
  const beaconNode = db.server.beaconProvider.get();
  if (!beaconNode)
    return {
      chainhead: null,
      syncing: null,
      peers: null,
      eth2NetworkName: ETH2_NETWORK_NAME
    };

  return await getNodeStatsMem(beaconNode);
}
