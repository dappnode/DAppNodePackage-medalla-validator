import fetch from "node-fetch";
import querystring from "querystring";
import * as db from "../db";
import { beaconGrpcGatewayUrl } from "../params";
import { logs } from "../logs";
import {
  ValidatorStatus,
  ValidatorData,
  ValidatorBalance,
  BeaconNodePeer,
  BeaconNodeChainhead
} from "../../common";

const apiUrl = beaconGrpcGatewayUrl;

// Metrics fetch in intervals the data and store it in the db
// Then the UI fetches the db state

/**
 * Collect metrics assuming accounts might be missing and could fail
 */
export function collectValidatorMetrics() {
  setInterval(async () => {
    try {
      const validators = db.accounts.validator.getAll();
      const pubKeys = validators.map(v => v.publicKey).filter(pubKey => pubKey);
      for (const pubKey of pubKeys)
        collectMetricsByPubkey(pubKey).catch(e => {
          logs.debug(`Error collecting ${pubKey} metrics`, e);
        });
    } catch (e) {
      logs.debug(`Error collecting validator metrics`, e);
    }

    try {
      const peers = await ethNodePeers();
      db.metrics.peers.set(peers);
    } catch (e) {
      logs.debug(`Error collecting peer metrics`, e);
    }

    try {
      const syncing = await ethNodeSyncing();
      db.metrics.syncing.set(syncing);
    } catch (e) {
      logs.debug(`Error collecting syncing metrics`, e);
    }

    try {
      const chainhead = await ethBeaconChainhead();
      db.metrics.chainhead.set(chainhead);
    } catch (e) {
      logs.debug(`Error collecting chainhead metrics`, e);
    }
  }, 5000);
}

async function collectMetricsByPubkey(publicKey: string) {
  const status = await ethValidatorStatus(publicKey);
  db.metrics.current.merge({ publicKey, ...status });
  // If the validator deposit in not recognized by layer2, skip other calls
  if (
    status.status === "UNKNOWN" ||
    status.status === "UNKNOWN_STATUS" ||
    status.status === "DEPOSITED"
  )
    return;

  try {
    const balances = await ethValidatorsBalances([publicKey]);
    const balanceData = balances[publicKey];
    if (balanceData) db.metrics.current.merge({ publicKey, ...balanceData });
  } catch (e) {
    logs.debug(`Error collecting ${publicKey} balance`, e);
  }

  try {
    const data = await ethValidator(publicKey);
    if (data) db.metrics.current.merge({ publicKey, ...data });
  } catch (e) {
    logs.debug(`Error collecting ${publicKey} data`, e);
  }
}

async function ethBeaconChainhead(): Promise<BeaconNodeChainhead> {
  const data = await fetchJson(`${apiUrl}/eth/v1alpha1/beacon/chainhead`);
  return data;
}

async function ethNodePeers(): Promise<BeaconNodePeer[]> {
  const data = await fetchJson(`${apiUrl}/eth/v1alpha1/node/peers`);
  return data.peers;
}

async function ethNodeSyncing(): Promise<{ syncing: boolean }> {
  const data = await fetchJson(`${apiUrl}/eth/v1alpha1/node/syncing`);
  return data;
}

async function ethValidatorStatus(publicKey: string): Promise<ValidatorStatus> {
  const qs = querystring.stringify({ publicKey: hexToBase64(publicKey) });
  return await fetchJson(`${apiUrl}/eth/v1alpha1/validator/status?${qs}`);
}

async function ethValidatorsStatus(
  pubKeys: string[]
): Promise<{ [pubKey: string]: ValidatorStatus }> {
  const dataByPubkey: { [pubKey: string]: ValidatorStatus } = {};
  await Promise.all(
    pubKeys.map(async pubKey => {
      dataByPubkey[pubKey] = await ethValidatorStatus(pubKey);
    })
  );
  return dataByPubkey;
}

async function ethValidator(publicKey: string): Promise<ValidatorData> {
  const qs = querystring.stringify({ publicKey: hexToBase64(publicKey) });
  return await fetchJson(`${apiUrl}/eth/v1alpha1/validator?${qs}`);
}

async function ethValidators(
  pubKeys: string[]
): Promise<{ [pubKey: string]: ValidatorData }> {
  const qs = qsPubKeys(pubKeys);
  const res = await fetchJson(`${apiUrl}/eth/v1alpha1/validators?${qs}`);
  const dataByPubkey: { [pubKey: string]: ValidatorData } = {};
  for (const item of res.validatorList) {
    dataByPubkey[base64ToHex(item.validator.publicKey)] = item.validator;
  }
  return dataByPubkey;
}

async function ethValidatorsBalances(
  pubKeys: string[]
): Promise<{ [pubKey: string]: ValidatorBalance }> {
  const qs = qsPubKeys(pubKeys);
  const res = await fetchJson(
    `${apiUrl}/eth/v1alpha1/validators/balances?${qs}`
  );

  // Data to obj form
  const dataByPubkey: { [pubKey: string]: ValidatorBalance } = {};
  for (const item of res.balances) {
    dataByPubkey[base64ToHex(item.publicKey)] = { balance: item.balance };
  }
  return dataByPubkey;
}

function hexToBase64(s: string): string {
  return Buffer.from(s.replace("0x", ""), "hex").toString("base64");
}

function base64ToHex(s: string): string {
  return "0x" + Buffer.from(s, "base64").toString("hex");
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok) throw Error(`${res.status} ${res.statusText}\n${body}`);
  try {
    return JSON.parse(body);
  } catch (e) {
    throw Error(`Error parsing request body: ${e.message}\n${body}`);
  }
}

function qsPubKeys(pubKeys: string[]): string {
  return querystring.stringify({ publicKeys: pubKeys.map(hexToBase64) });
}
