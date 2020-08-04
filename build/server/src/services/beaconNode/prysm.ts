import {
  ValidatorStatus,
  BeaconNodeChainhead,
  SyncStatus
} from "../../../common";
import fetch, { Response } from "node-fetch";
import querystring from "querystring";
import { urlJoin } from "../../utils/url";
import { BeaconNodeClient } from "./interface";

export class PrysmBeaconNodeClient implements BeaconNodeClient {
  grpcGatewayUrl: string;
  // TODO: Fetch from config
  slotsPerEpoch = 32;

  /**
   * @param grpcGatewayUrl "http://prysm-altona-beacon-chain.dappnode:3500"
   */
  constructor(grpcGatewayUrl: string) {
    this.grpcGatewayUrl = grpcGatewayUrl;
  }

  // Metrics fetch in intervals the data and store it in the db
  // Then the UI fetches the db state

  async chainhead(): Promise<BeaconNodeChainhead> {
    const data = await this.fetch<BeaconNodeChainhead>(
      "/eth/v1alpha1/beacon/chainhead"
    );
    return {
      headSlot: data.headSlot,
      headBlockRoot: data.headBlockRoot,
      finalizedSlot: data.finalizedSlot,
      slotsPerEpoch: this.slotsPerEpoch
    };
  }

  async peers(): Promise<string[]> {
    const data = await this.fetch<{
      peers: {
        address: string; // '/ip4/104.36.201.234/tcp/13210/p2p/16Uiu2HAm5RX4gAQtwqArBmuuGugUXAViKaKBx6ugDJb1L1RFcpfK',
        direction: string; // 'OUTBOUND'
      }[];
    }>("/eth/v1alpha1/node/peers");
    return data.peers.map(peer => peer.address);
  }

  async syncing(): Promise<SyncStatus> {
    const syncing = await this.fetch<{ syncing: boolean }>(
      "/eth/v1alpha1/node/syncing"
    );
    return syncing
      ? {
          startingSlot: 0,
          currentSlot: 0,
          highestSlot: 0
        }
      : null;
  }

  async validators(
    pubKeys: string[]
  ): Promise<{ [pubKey: string]: ValidatorStatus }> {
    // Data to obj form
    const dataByPubkey: { [pubKey: string]: ValidatorStatus } = {};

    const statusData = await this.fetch<{
      publicKeys: string[];
      statuses: ValidatorStatus[];
    }>("/eth/v1alpha1/validator/statuses", qsPubKeys(pubKeys));

    const balanceData = await this.fetch<{
      balances: { publicKey: string }[];
    }>("/eth/v1alpha1/validators/balances", qsPubKeys(pubKeys));

    statusData.statuses.forEach((status, i) => {
      const pubkeyBase64 = statusData.publicKeys[i];
      const pubkey = base64ToHex(statusData.publicKeys[i]);
      const balance = balanceData.balances.find(
        v => v.publicKey === pubkeyBase64
      );
      if (balance) dataByPubkey[pubkey] = { ...status, ...balance };
    });

    return dataByPubkey;
  }

  private async fetch<R>(apiPath: string, qs?: string): Promise<R> {
    if (qs) apiPath = `${apiPath}?${qs}`;
    const url = urlJoin(this.grpcGatewayUrl, apiPath);
    const res = await fetch(url);
    return parseFetchJson(res);
  }
}

/**
 * Parse a node-fetch response providing more meaningful messages
 * if the body of an error response does not contain JSON
 */
async function parseFetchJson<R>(res: Response): Promise<R> {
  const body = await res.text();
  if (!res.ok) throw Error(`${res.status} ${res.statusText}\n${body}`);
  try {
    return JSON.parse(body);
  } catch (e) {
    throw Error(`Error parsing request body: ${e.message}\n${body}`);
  }
}

/**
 * Util to construct pubkeys query string array URL query param for Prysm
 */
function qsPubKeys(pubKeys: string[]): string {
  return querystring.stringify({ publicKeys: pubKeys.map(hexToBase64) });
}

/**
 * Util to encode Prysm pubkeys
 */
function hexToBase64(s: string): string {
  return Buffer.from(s.replace("0x", ""), "hex").toString("base64");
}

/**
 * Util to decode Prysm pubkeys
 */
function base64ToHex(s: string): string {
  return "0x" + Buffer.from(s, "base64").toString("hex");
}