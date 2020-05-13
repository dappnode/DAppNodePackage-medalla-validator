import {
  WalletAccount,
  EthdoAccount,
  EthdoAccountNoPass,
  ValidatorStats,
  NodeStats,
} from "./types";

export interface Routes {
  accountValidatorList: () => Promise<WalletAccount[]>;
  accountWithdrawalList: () => Promise<WalletAccount[]>;
  accountWithdrawalCreate: (account: EthdoAccount) => Promise<void>;
  accountValidatorCreate: (account: EthdoAccountNoPass) => Promise<void>;
  getDepositData: (args: {
    validatorAccount: string;
    withdrawalAccount: string;
  }) => Promise<string>;
  // Internal Eth1 account
  eth1AccountGet: () => Promise<{
    address: string;
    balance: number;
    insufficientFunds: boolean;
  }>;
  eth1MakeDeposit: (depositData: string) => Promise<string | undefined>;
  // Validator stats
  validatorsStats: () => Promise<ValidatorStats[]>;
  // Node stats
  nodeStats: () => Promise<NodeStats>;
}

export const routesData: { [P in keyof Routes]: {} } = {
  accountValidatorList: {},
  accountWithdrawalList: {},
  accountValidatorCreate: {},
  accountWithdrawalCreate: {},
  getDepositData: {},
  eth1AccountGet: {},
  eth1MakeDeposit: {},
  validatorsStats: {},
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
