import { dbFactory } from "./dbFactory";

const dbInitialState: {
  validatorAccounts: {
    [name: string]: {
      account: string;
      passphrase: string;
      depositData?: string;
    };
  };
} = {
  validatorAccounts: {}
};

export const db = dbFactory("account-db.json", dbInitialState);
