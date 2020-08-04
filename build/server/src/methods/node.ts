import memoizee from "memoizee";
import { NodeStats, BeaconProviderName } from "../../common";
import { eth2NetworkName } from "../params";
import { server } from "../db";
import { getBeaconNodeClient } from "../services/beaconNode";

async function getNodeStats(
  beaconNode: BeaconProviderName
): Promise<NodeStats> {
  const beaconNodeClient = getBeaconNodeClient(beaconNode);
  return {
    chainhead: await beaconNodeClient.chainhead(),
    syncing: await beaconNodeClient.syncing(),
    peers: await beaconNodeClient.peers(),
    eth2NetworkName
  };
}

const getNodeStatsMem = memoizee(getNodeStats, {
  maxAge: 12 * 1000,
  promise: true
});

export async function nodeStats(): Promise<NodeStats> {
  const beaconNode = server.beaconProvider.get();
  return await getNodeStatsMem(beaconNode);
}
