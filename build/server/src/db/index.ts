import path from "path";
import { lowDbStaticFactory } from "./dbFactory";
import {
  DepositEvent,
  ValidatorMetrics,
  BeaconNodePeer,
  BeaconNodeChainhead
} from "../../common";
import { getRandomToken } from "../utils/token";

export const dbDir = process.env.DB_API_DIR || "db-api";
export const sessionsPath = path.join(dbDir, "sessions");
const serverDbPath = path.join(dbDir, "server-db.json");
const accountsDbPath = path.join(dbDir, "account-db.json");
const depositsDbPath = path.join(dbDir, "deposits-db.json");
const metricsDbPath = path.join(dbDir, "metrics-db.json");

interface DbValidator {
  account: string; // "Validator/1"
  publicKey: string;
  passphrase: string;
  depositData?: string;
  createdTimestamp: number; // in miliseconds
}

interface DbWithdrawl {
  account: string; // "Validator/1"
  passphrase?: string;
  createdTimestamp: number; // in miliseconds
}

const dbServerState: {
  sessionsSecret: string | null;
} = {
  sessionsSecret: null
};

const dbAccountsState: {
  validatorAccounts: {
    [name: string]: DbValidator;
  };
  withdrawlAccounts: {
    [name: string]: DbWithdrawl;
  };
  eth1Account:
    | {
        address: string;
        privateKey: string;
      }
    | undefined;
} = {
  validatorAccounts: {},
  withdrawlAccounts: {},
  eth1Account: undefined
};

const dbDepositsState: {
  depositEvents: {
    [pubkey: string]: {
      [txHashLogIndex: string]: DepositEvent;
    };
  };
} = {
  depositEvents: {}
};

const dbMetricsState: {
  current: {
    [pubKey: string]: Partial<ValidatorMetrics>;
  };
  peers: BeaconNodePeer[];
  syncing: {
    syncing: boolean;
  } | null;
  chainhead: BeaconNodeChainhead | null;
} = {
  current: {},
  peers: [],
  syncing: null,
  chainhead: null
};

export const server = lowDbStaticFactory(serverDbPath, dbServerState);
export const accounts = lowDbStaticFactory(accountsDbPath, dbAccountsState);
export const deposits = lowDbStaticFactory(depositsDbPath, dbDepositsState);
export const metrics = lowDbStaticFactory(metricsDbPath, dbMetricsState);

export function updateValidator(validator: DbValidator) {
  accounts.validatorAccounts.merge({ [validator.account]: validator });
}

export function updateWithdrawl(withdrawl: DbWithdrawl) {
  accounts.withdrawlAccounts.merge({ [withdrawl.account]: withdrawl });
}

export function updateMetrics(pubKey: string, data: Partial<ValidatorMetrics>) {
  metrics.current.merge({ [pubKey]: data });
}

export function getSessionsSecretKey() {
  let secret = server.sessionsSecret.get();
  if (!secret) {
    secret = getRandomToken();
    server.sessionsSecret.set(secret);
  }
  return secret;
}
