import { dbFactory } from "./dbFactory";

const dbInitialState: {
  validatorAccounts: {
    [name: string]: {
      account: string;
      passphrase: string;
      depositData?: string;
    };
  };
  eth1Account:
    | {
        address: string;
        privateKey: string;
      }
    | undefined;
} = {
  validatorAccounts: {},
  eth1Account: undefined
};

export const db = dbFactory("account-db.json", dbInitialState);
