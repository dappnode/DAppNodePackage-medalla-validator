import querystring from "querystring";
import {
  ValidatorStatus,
  BeaconNodeChainhead,
  SyncStatus
} from "../../../common";
import fetch from "node-fetch";
import { urlJoin, parseFetchJson } from "../../utils";
import { BeaconNodeClient } from "./interface";

interface LighthouseValidatorStatus {
  pubkey: string; // "0x98f87bc7c8fa10408425bbeeeb3dc387e3e0b4bd92f57775b60b39156a16f9ec80b273a64269332d97bdb7d93ae05a16",
  withdrawal_credentials: string; // "0x00b7bec22d5bda6b2cca1343d4f640d0e9ccc204a06a73703605c590d4c0d28e",
  effective_balance: number; // 3200000000,
  slashed: boolean; // false,
  activation_eligibility_epoch: number; // 0,
  activation_epoch: number; // 0,
  exit_epoch: number; // 18446744073709551615,
  withdrawable_epoch: number; // 18446744073709551615
}

interface EthV1ApiNodeSyncingNodePeer {
  peer_id: string; // "QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx5N"
}

interface EthV1ApiNodeSyncing {
  /**
   * Head slot node is trying to reach
   */
  head_slot: string;
  /**
   * How many slots node needs to process to reach head. 0 if synced.
   */
  sync_distance: string;
}

interface EthV1ApiNodeSyncingValidatorStatus {
  index: string; // "1",
  balance: string; // "1",
  status: string; // "active_ongoing",
  validator: {
    pubkey: string; // "0x93247f2209abcacf57b75a51dafae777f9dd38bc7053d1af526f220a7489a6d3a2753e5f3e8b1cfe39b56f43611df74a",
    withdrawal_credentials: string; // "0xcf8e0d4e9587369b2301d0790347320302cc0943d5a1884560367e8208d920f2",
    effective_balance: string; // "1",
    slashed: boolean; // false,
    activation_eligibility_epoch: string; // "1",
    activation_epoch: string; // "1",
    exit_epoch: string; // "1",
    withdrawable_epoch: string; // "1"
  };
}

export class LighthouseNodeClient implements BeaconNodeClient {
  grpcGatewayUrl: string;
  // TODO: Fetch from config
  slotsPerEpoch = 32;

  /**
   * @param grpcGatewayUrl "http://lighthouse-zinken-beacon-chain.dappnode:5052"
   */
  constructor(grpcGatewayUrl: string) {
    this.grpcGatewayUrl = grpcGatewayUrl;
  }

  // Metrics fetch in intervals the data and store it in the db
  // Then the UI fetches the db state

  async peers(): Promise<string[]> {
    const peers = await this.fetch<EthV1ApiNodeSyncingNodePeer[]>(
      "/eth/v1/node/peers"
    );
    return peers.map(peer => peer.peer_id);
  }

  async syncing(): Promise<SyncStatus> {
    return await this.fetch<EthV1ApiNodeSyncing>("/eth/v1/node/syncing");
  }

  async validators(
    pubkeys: string[]
  ): Promise<{ [pubKey: string]: ValidatorStatus }> {
    const validators = await this.fetch<EthV1ApiNodeSyncingValidatorStatus[]>(
      "/eth/v1/beacon/states/head/validators",
      { id: pubkeys }
    );

    const dataByPubkey: { [pubKey: string]: ValidatorStatus } = {};
    for (const validator of validators) {
      dataByPubkey[validator.validator.pubkey] = {
        status: validator.status,
        index: validator.index,
        balance: validator.balance
      };
    }

    return dataByPubkey;
  }

  private async fetch<R>(
    apiPath: string,
    query?: { [key: string]: any }
  ): Promise<R> {
    let url = urlJoin(this.grpcGatewayUrl, apiPath);
    if (query) url += "?" + querystring.stringify(query);
    const res = await fetch(url);
    return parseFetchJson(res);
  }
}
