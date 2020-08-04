import {
  ValidatorStats,
  NodeStats,
  ValidatorFiles,
  ValidatorClientName,
  ValidatorSettings,
  BeaconProviderName,
} from "./types";

export interface Routes {
  /**
   * List current validator files in disk, plus their stats
   */
  getValidators: () => Promise<ValidatorStats[]>;
  /**
   * Current beacon node stats
   */
  nodeStats: () => Promise<NodeStats>;
  /**
   * Import validator keystores and passphrases
   */
  importValidators: (validators: ValidatorFiles[]) => Promise<void>;
  /**
   * Returns configurable validator parameters
   */
  getValidatorSettings: () => Promise<ValidatorSettings>;
  /**
   * Switch validator client. Kills current one and starts next after exit
   */
  switchValidatorClient: (newClient: ValidatorClientName) => Promise<void>;
  /**
   * Set the beaconProvider (name or URL) setting
   */
  setBeaconProvider: (newBeaconProvider: BeaconProviderName) => Promise<void>;
}

export const routesData: { [P in keyof Routes]: {} } = {
  getValidators: {},
  nodeStats: {},
  importValidators: {},
  getValidatorSettings: {},
  switchValidatorClient: {},
  setBeaconProvider: {},
};

// DO NOT REMOVE
// Enforces that each route is a function that returns a promise
export type RoutesArguments = { [K in keyof Routes]: Parameters<Routes[K]> };
export type RoutesReturn = {
  [K in keyof Routes]: ReplaceVoidWithNull<ResolvedType<Routes[K]>>;
};

/**
 * Returns the return resolved type of a function type
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type ResolvedType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : never;
/* eslint-disable @typescript-eslint/no-explicit-any */

export type ReplaceVoidWithNull<T> = T extends void ? null : T;
