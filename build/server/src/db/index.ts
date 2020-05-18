import path from "path";
import { createLowDb } from "./lowDb";
import { createDb, collection, regular } from "./dbAdaptor";
import {
  PendingValidator,
  DepositEvents,
  ValidatorMetrics,
  BeaconNodePeer,
  BeaconNodeChainhead
} from "../../common";
import { getRandomToken } from "../utils/token";
import { dbDir } from "../params";

export const sessionsPath = path.join(dbDir, "sessions");
const serverDbPath = path.join(dbDir, "server-db.json");
const accountsDbPath = path.join(dbDir, "account-db.json");
const depositsDbPath = path.join(dbDir, "deposits-db.json");
const metricsDbPath = path.join(dbDir, "metrics-db.json");

interface DbValidator {
  account: string; // "validator/1"
  publicKey: string;
  passphrase: string;
  depositData?: string;
  createdTimestamp: number; // in miliseconds
}

interface DbWithdrawal {
  account: string; // "withdrawal/primary"
  publicKey: string;
  passphrase?: string;
  createdTimestamp: number; // in miliseconds
}

export const server = createDb(createLowDb(serverDbPath), {
  sessionsSecret: regular<string>()
});

export const accounts = createDb(createLowDb(accountsDbPath), {
  pendingValidators: collection<PendingValidator>(v => v.account),
  validator: collection<DbValidator>(v => v.account),
  withdrawal: collection<DbWithdrawal>(v => v.account),
  eth1: regular<{ address: string; privateKey: string }>()
});

export const deposits = createDb(createLowDb(depositsDbPath), {
  depositEvents: collection<DepositEvents>(e => e.publicKey)
});

export const metrics = createDb(createLowDb(metricsDbPath), {
  current: collection<ValidatorMetrics>(d => d.publicKey),
  peers: regular<BeaconNodePeer[]>(),
  syncing: regular<{ syncing: boolean }>(),
  chainhead: regular<BeaconNodeChainhead>()
});

export function getSessionsSecretKey() {
  let secret = server.sessionsSecret.get();
  if (!secret) {
    secret = getRandomToken();
    server.sessionsSecret.set(secret);
  }
  return secret;
}
