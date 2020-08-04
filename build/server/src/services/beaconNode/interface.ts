import {
    ValidatorStatus,
    BeaconNodeChainhead,
    SyncStatus
} from "../../../common";

export interface BeaconNodeClient {
    chainhead(): Promise<BeaconNodeChainhead>;
    peers(): Promise<string[]>;
    syncing(): Promise<SyncStatus>;
    validators(
        pubKeys: string[]
    ): Promise<{ [pubKey: string]: ValidatorStatus }>;
}
