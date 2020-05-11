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
  id: string;
  name: string;
  uuid: string;
  publicKey: string;
  createdTimestamp?: number;
  available?: boolean;
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
  id: string;
  name: string;
  uuid: string;
  publicKey: string;
  createdTimestamp?: number;
  depositEvents: {
    [txHashAndLogIndex: string]: DepositEvent;
  };
  status: string;
  balance: number;
}

export interface DepositEvent extends DepositEventArgs {
  blockNumber: number | undefined;
  txHash: string | undefined;
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
