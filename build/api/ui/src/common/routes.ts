import { ValidatorAccount, WithdrawlAccount } from "./types";

export interface Routes {
  accountWithdrawlCreate: (args: {
    name: string;
    passphrase: string;
  }) => Promise<void>;
  accountWithdrawlList: () => Promise<WithdrawlAccount[]>;
  newValidator: (
    withdrawalAccount: string
  ) => Promise<{ depositData: string; account: string }>;
  // Internal Eth1 account
  eth1AccountGet: () => Promise<{
    address: string;
    balance: number;
    insufficientFunds: boolean;
  }>;
  eth1MakeDeposit: (depositData: string) => Promise<string | undefined>;
}

export const routesData: { [P in keyof Routes]: {} } = {
  accountWithdrawlCreate: {},
  accountWithdrawlList: {},
  newValidator: {},
  eth1AccountGet: {},
  eth1MakeDeposit: {},
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
