import { dbFactory } from "./dbFactory";
import { merge } from "lodash";

interface DbValidator {
  account: string; // "Validator/1"
  passphrase: string;
  depositData?: string;
}

const dbInitialState: {
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

export const db = dbFactory("account-db.json", dbInitialState);

export function updateValidator(validator: DbValidator) {
  db.validatorAccounts.set(
    merge(db.validatorAccounts.get(), {
      [validator.account]: validator
    })
  );
}
