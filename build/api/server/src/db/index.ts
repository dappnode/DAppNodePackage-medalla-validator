import path from "path";
import { dbFactory } from "./dbFactory";
import { DepositEvent } from "../../common";

const dbDir = process.env.DB_API_DIR || "db-api";
const accountsDbPath = path.join(dbDir, "account-db.json");
const depositsDbPath = path.join(dbDir, "deposits-db.json");

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

export const accounts = dbFactory(accountsDbPath, dbAccountsInitialState);
export const deposits = dbFactory(depositsDbPath, dbDepositsInitialState);

export function updateValidator(validator: DbValidator) {
  accounts.validatorAccounts.merge({ [validator.account]: validator });
}
