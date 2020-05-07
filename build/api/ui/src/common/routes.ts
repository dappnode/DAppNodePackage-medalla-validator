import { ValidatorAccount } from "./types";

export interface Routes {
  accountCreate: (name: string) => Promise<void>;
  accountsGet: () => Promise<ValidatorAccount[]>;
}

export const routesData: { [P in keyof Routes]: {} } = {
  accountCreate: {},
  accountsGet: {}
};

// DO NOT REMOVE -
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
