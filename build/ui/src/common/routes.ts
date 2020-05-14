import { ValidatorStats, PendingValidator, NodeStats } from "./types";

export interface Routes {
  addValidators: (count: number) => Promise<PendingValidator[]>;
  getPendingValidators: () => Promise<PendingValidator[]>;
  getValidators: () => Promise<ValidatorStats[]>;
  // Internal Eth1 account
  eth1AccountGet: () => Promise<{
    address: string;
    balance: number;
    insufficientFunds: boolean;
  }>;
  // Node stats
  nodeStats: () => Promise<NodeStats>;
}

export const routesData: { [P in keyof Routes]: {} } = {
  addValidators: {},
  getPendingValidators: {},
  getValidators: {},
  eth1AccountGet: {},
  nodeStats: {},
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
