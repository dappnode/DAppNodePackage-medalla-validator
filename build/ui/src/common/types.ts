// Table type

export interface PendingValidator {
  account: string;
  publicKey: string;
  status: "pending" | "mined" | "confirmed" | "error";
  txHash?: string;
  blockNumber?: number;
  amountEth?: number;
  error?: string;
  createdTimestamp?: number;
  errorTimestamp?: number;
}

export interface ValidatorAccountNew {
  name: string;
  publicKey: string;
  depositInfo: {
    [txHash: string]: {
      txHash?: string;
      blockNumber?: number;
    };
  };
  status?: string;
  balance: {
    eth: number | null; // 32.4523
    isEstimated: boolean;
  };
}

export interface ApiStatus {
  eth1Account: {
    address: string;
    balanceEth: string;
  };
  totalBalance: {
    eth: string | null; // "32.543"
    isEstimated: boolean;
  };
}

// Old types

export interface EthdoWallets {
  name: string;
  accounts: string[];
}

export interface ValidatorAccount {
  name: string;
  wallet: string;
  status: string;
  balance: number;
}

export interface WalletAccount {
  account: string;
  name: string;
  uuid: string;
  publicKey: string;
  createdTimestamp?: number;
  available?: boolean;
}

export interface EthdoAccountResult {
  account: string;
  publicKey: string;
  passphrase: string;
}

export interface EthdoAccount {
  account: string;
  passphrase: string;
}

export interface EthdoAccountNoPass {
  account: string;
  passphrase?: string;
}

export interface ValidatorStats {
  account: string;
  name: string;
  uuid: string;
  publicKey: string;
  createdTimestamp?: number;
  depositEvents: DepositEvents;
  status?: string;
  balance?: string;
  effectiveBalance?: string;
}

export interface DepositEvents {
  [txHashAndLogIndex: string]: DepositEvent;
}

export interface DepositEvent extends DepositEventArgs {
  blockNumber: number | undefined;
  txHash: string | undefined;
}

export interface NodeStats {
  peers: BeaconNodePeer[] | null;
  syncing: { syncing: boolean } | null;
  chainhead: BeaconNodeChainhead | null;
}

// Prysm deposit contract

export interface DepositEventArgs {
  pubkey: string; // '0xb01d89a3abf76b659e0ddfe7f08bc2df7900e70a9ac0dadef40ec4364cfc10bd679cf939b3497856f719101d33ef2eea',
  withdrawal_credentials: string; // "0x00b6589882996478845d4dd2ca85a57387d6a392217808c908add83b160a0fa7";
  amount: string; // "0x0040597307000000";
  signature: string; // "0x9085a737a4490a403e9d0773abcb283b39270a97df7e6fc95c10ac6e6ade3698a88d00b0712fd95b3c2c519035b829160efa34962c92d1dd440db532c5b9bdabf91c7927c3ca1350eb2eb0b52700abd2e704bb547a2dd1ecfa0368a4d72da5e6";
  index: string; // "0x6200000000000000";
}

export const depositEventAbi = {
  name: "DepositEvent",
  inputs: [
    { type: "bytes", name: "pubkey", indexed: false },
    { type: "bytes", name: "withdrawal_credentials", indexed: false },
    { type: "bytes", name: "amount", indexed: false },
    { type: "bytes", name: "signature", indexed: false },
    { type: "bytes", name: "index", indexed: false },
  ],
  anonymous: false,
  type: "event",
};

// Metrics from Node's gRPC gateway

export type ValidatorMetrics = ValidatorStatus &
  ValidatorData &
  ValidatorBalance;

export interface ValidatorStatus {
  /**
   * DEPOSITED - validator's deposit has been recognized by Ethereum 1, not yet recognized by Ethereum 2.
   * PENDING - validator is in Ethereum 2's activation queue.
   * ACTIVE - validator is active.
   * EXITING - validator has initiated an an exit request, or has dropped below the ejection balance and is being kicked out.
   * EXITED - validator is no longer validating.
   * SLASHING - validator has been kicked out due to meeting a slashing condition.
   * UNKNOWN_STATUS - validator does not have a known status in the network.
   */
  status: string; // "UNKNOWN_STATUS";
  eth1DepositBlockNumber: string;
  depositInclusionSlot: string;
  activationEpoch: string; // "213"
  positionInActivationQueue: string; // "0"
}

export interface ValidatorData {
  publicKey: string; // "tO1tB5njWwO5oc5MrJJ46P6PwGxKjKzsz48yxDQ/G9RJHcURtY6v4UQGDsrNijf3",
  withdrawalCredentials: string; // "ANYN9tCy0rm4uUARNiT9qT2N2xwREjiRJqfsfTZBG9A="
  effectiveBalance: string; // "32000000000"
  slashed: boolean; // false
  activationEligibilityEpoch: string; // "0"
  activationEpoch: string; // "0"
  exitEpoch: string; // "18446744073709551615"
  withdrawableEpoch: string; // "18446744073709551615"
}

export interface ValidatorBalance {
  balance: string;
}

export interface BeaconNodePeer {
  address: string; // '/ip4/104.36.201.234/tcp/13210/p2p/16Uiu2HAm5RX4gAQtwqArBmuuGugUXAViKaKBx6ugDJb1L1RFcpfK',
  direction: string; // 'OUTBOUND'
}

export interface BeaconNodeChainhead {
  headSlot: string; // '177684',
  headEpoch: string; // '5552',
  headBlockRoot: string; // 'y1GDABJ0iPgZhdcWBXTon4r2TgEnpS3XFISckLyqa+U=',
  finalizedSlot: string; // '177600',
  finalizedEpoch: string; // '5550',
  finalizedBlockRoot: string; // 'Bb/6F2NfmtilyxQb+2tItGlD1WNwR17gMVd5kIxjgCQ=',
  justifiedSlot: string; // '177632',
  justifiedEpoch: string; // '5551',
  justifiedBlockRoot: string; // 'e+1HeaYj+a/u9gPyUfyUhrGDyv/5BkpOXiF8KnXcItc=',
  previousJustifiedSlot: string; // '177600',
  previousJustifiedEpoch: string; // '5550',
  previousJustifiedBlockRoot: string; // 'Bb/6F2NfmtilyxQb+2tItGlD1WNwR17gMVd5kIxjgCQ=' }
}
