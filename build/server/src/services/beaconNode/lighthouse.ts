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

export class LighthouseNodeClient implements BeaconNodeClient {
  grpcGatewayUrl: string;
  // TODO: Fetch from config
  slotsPerEpoch = 32;

  /**
   * @param grpcGatewayUrl "http://lighthouse-medalla-beacon-chain.dappnode:5052"
   */
  constructor(grpcGatewayUrl: string) {
    this.grpcGatewayUrl = grpcGatewayUrl;
  }

  // Metrics fetch in intervals the data and store it in the db
  // Then the UI fetches the db state

  async chainhead(): Promise<BeaconNodeChainhead> {
    const head = await this.fetch<{
      slot: number; // 37923,
      block_root: string; // "0xe865d4805395a0776b8abe46d714a9e64914ab8dc5ff66624e5a1776bcc1684b",
      state_root: string; // "0xe500e3567ab273c9a6f8a057440deff476ab236f0983da27f201ee9494a879f0",
      finalized_slot: number; // 37856,
      finalized_block_root: string; // "0xbdae152b62acef1e5c332697567d2b89e358628790b8273729096da670b23e86",
      justified_slot: number; // 37888,
      justified_block_root: string; // "0x01c2f516a407d8fdda23cad4ed4381e4ab8913d638f935a2fe9bd00d6ced5ec4",
      previous_justified_slot: number; // 37856,
      previous_justified_block_root: string; // "0xbdae152b62acef1e5c332697567d2b89e358628790b8273729096da670b23e86"
    }>("/beacon/head");
    return {
      headSlot: head.slot,
      headBlockRoot: head.block_root,
      finalizedSlot: head.finalized_slot,
      slotsPerEpoch: this.slotsPerEpoch
    };
  }

  async peers(): Promise<string[]> {
    // peers = ["QmaPGeXcfKFMU13d8VgbnnpeTxcvoFoD9bUpnRGMUJ1L9w"]
    return await this.fetch<string[]>("/network/peers");
  }

  async syncing(): Promise<SyncStatus> {
    const data = await this.fetch<{
      is_syncing: boolean; // true;
      sync_status: {
        starting_slot: number; // 0;
        current_slot: number; // 100;
        highest_slot: number; // 200;
      };
    }>("/node/syncing");
    if (data.is_syncing)
      return {
        startingSlot: data.sync_status.starting_slot,
        currentSlot: data.sync_status.current_slot,
        highestSlot: data.sync_status.highest_slot
      };
    else return null;
  }

  async validators(
    pubkeys: string[]
  ): Promise<{ [pubKey: string]: ValidatorStatus }> {
    const validators = await this.fetchPost<
      {
        pubkey: string; // "0x98f87bc7c8fa10408425bbeeeb3dc387e3e0b4bd92f57775b60b39156a16f9ec80b273a64269332d97bdb7d93ae05a16",
        validator_index: number | null; // 14935,
        balance: number | null; // 3228885987,
        validator: LighthouseValidatorStatus | null;
      }[],
      {
        state_root?: string;
        pubkeys: string[];
      }
    >("/beacon/validators", { pubkeys });

    const chainhead = await this.chainhead();
    const currentEpoch = chainhead.headSlot % this.slotsPerEpoch;

    const dataByPubkey: { [pubKey: string]: ValidatorStatus } = {};
    for (const validator of validators) {
      dataByPubkey[validator.pubkey] = {
        status: computeValidatorStatus(validator.validator, currentEpoch),
        index: validator.validator_index,
        balance: validator.balance
      };
    }

    return dataByPubkey;
  }

  private async fetch<R>(apiPath: string): Promise<R> {
    const url = urlJoin(this.grpcGatewayUrl, apiPath);
    const res = await fetch(url);
    return parseFetchJson(res);
  }

  private async fetchPost<R, T>(apiPath: string, body: T): Promise<R> {
    const url = urlJoin(this.grpcGatewayUrl, apiPath);
    const res = await fetch(url, {
      method: "POST",
      // @ts-ignore
      body: JSON.stringify(body),
      // @ts-ignore
      headers: { "Content-Type": "application/json" }
    });
    return parseFetchJson(res);
  }
}

/**
 * Compute a validator status from its state
 * @param validator
 * @param currentEpoch
 */
function computeValidatorStatus(
  validator: LighthouseValidatorStatus | null,
  currentEpoch: number
): ValidatorStatus["status"] {
  const farFutureEpoch = Number.MAX_SAFE_INTEGER;
  if (!validator) return "UNKNOWN_STATUS";
  if (currentEpoch < validator.activation_eligibility_epoch) return "DEPOSITED";
  if (currentEpoch < validator.activation_epoch) return "PENDING";
  if (validator.exit_epoch >= farFutureEpoch) return "ACTIVE";
  if (currentEpoch < validator.exit_epoch)
    if (validator.slashed) return "SLASHING";
    else return "EXITING";
  return "EXITED";
}
