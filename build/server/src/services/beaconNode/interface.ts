import {
  ValidatorStatus,
  BeaconNodeChainhead,
  SyncStatus
} from "../../../common";

export type ValidatorStatusByPubkey = { [pubKey: string]: ValidatorStatus };

export interface BeaconNodeClient {
  chainhead(): Promise<BeaconNodeChainhead>;
  peers(): Promise<string[]>;
  syncing(): Promise<SyncStatus>;
  validators(pubKeys: string[]): Promise<ValidatorStatusByPubkey>;
}
