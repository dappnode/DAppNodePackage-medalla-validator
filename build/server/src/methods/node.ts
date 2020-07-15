import memoizee from "memoizee";
import { NodeStats } from "../../common";
import { eth2NetworkName } from "../params";
import {
  ethNodePeers,
  ethNodeSyncing,
  ethBeaconChainhead
} from "../services/metrics";
import { logs } from "../logs";

const ethNodePeersMem = memoizee(ethNodePeers, {
  maxAge: 12 * 1000,
  promise: true
});
const ethNodeSyncingMem = memoizee(ethNodeSyncing, {
  maxAge: 12 * 1000,
  promise: true
});
const ethBeaconChainheadMem = memoizee(ethBeaconChainhead, {
  maxAge: 12 * 1000,
  promise: true
});

export async function nodeStats(): Promise<NodeStats> {
  const peers = await ethNodePeersMem().catch(e =>
    logs.error(`Error fetching node peers`, e)
  );
  const syncing = await ethNodeSyncingMem().catch(e =>
    logs.error(`Error fetching node syncing status`, e)
  );
  const chainhead = await ethBeaconChainheadMem().catch(e =>
    logs.error(`Error fetching node chainhead`, e)
  );

  return {
    peers: peers || null,
    syncing: syncing || null,
    chainhead: chainhead || null,
    eth2NetworkName
  };
}
