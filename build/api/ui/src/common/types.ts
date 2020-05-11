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

export interface WithdrawlAccount {
  id: string;
  name: string;
}

export interface EthdoAccount {
  account: string;
  passphrase: string;
}

export interface EthdoAccountNoPass {
  account: string;
  passphrase?: string;
}
