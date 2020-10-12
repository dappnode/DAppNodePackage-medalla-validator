import { ValidatorStatus, SyncStatus } from "../../../common";

export type ValidatorStatusByPubkey = { [pubKey: string]: ValidatorStatus };

export interface BeaconNodeClient {
  peers(): Promise<string[]>;
  syncing(): Promise<SyncStatus>;
  validators(pubKeys: string[]): Promise<ValidatorStatusByPubkey>;
}
