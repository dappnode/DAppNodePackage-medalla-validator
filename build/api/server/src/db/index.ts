import { dbFactory } from "./dbFactory";
import { DepositEvent } from "../../common";

interface DbValidator {
  account: string; // "Validator/1"
  passphrase: string;
  depositData?: string;
  createdTimestamp: number; // in miliseconds
}

const dbAccountsInitialState: {
  validatorAccounts: {
    [name: string]: DbValidator;
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

const dbDepositsInitialState: {
  depositEvents: {
    [pubkey: string]: {
      [txHashLogIndex: string]: DepositEvent;
    };
  };
} = {
  depositEvents: {}
};

export const accounts = dbFactory("account-db.json", dbAccountsInitialState);
export const deposits = dbFactory("deposits-db.json", dbDepositsInitialState);

export function updateValidator(validator: DbValidator) {
  accounts.validatorAccounts.merge({ [validator.account]: validator });
}
