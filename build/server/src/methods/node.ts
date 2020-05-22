import { NodeStats } from "../../common";
import { eth2NetworkName } from "../params";
import * as db from "../db";

export async function nodeStats(): Promise<NodeStats> {
  const peers = db.metrics.peers.get();
  const syncing = db.metrics.syncing.get();
  const chainhead = db.metrics.chainhead.get();

  return {
    peers: peers || null,
    syncing: syncing || null,
    chainhead: chainhead || null,
    eth2NetworkName
  };
}
