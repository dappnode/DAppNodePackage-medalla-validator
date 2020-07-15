import querystring from "querystring";
import {
  ValidatorStatus,
  ValidatorData,
  ValidatorBalance,
  BeaconNodePeer,
  BeaconNodeChainhead
} from "../../common";
import { qsPubKeys, base64ToHex, fetchGrpc, hexToBase64 } from "../utils/grpc";

// Metrics fetch in intervals the data and store it in the db
// Then the UI fetches the db state

export async function ethBeaconChainhead(): Promise<BeaconNodeChainhead> {
  const data = await fetchGrpc(`eth/v1alpha1/beacon/chainhead`);
  return data;
}

export async function ethNodePeers(): Promise<BeaconNodePeer[]> {
  const data = await fetchGrpc(`/eth/v1alpha1/node/peers`);
  return data.peers;
}

export async function ethNodeSyncing(): Promise<{ syncing: boolean }> {
  const data = await fetchGrpc(`/eth/v1alpha1/node/syncing`);
  return data;
}

async function ethValidatorStatus(publicKey: string): Promise<ValidatorStatus> {
  const qs = querystring.stringify({ publicKey: hexToBase64(publicKey) });
  return await fetchGrpc(`/eth/v1alpha1/validator/status?${qs}`);
}

export async function ethValidatorStatuses(
  pubKeys: string[]
): Promise<{ [pubKey: string]: ValidatorStatus }> {
  const qs = qsPubKeys(pubKeys);
  // res = { publicKeys: [
  //     'sTbt9DfodQZFVg0k8Nb/ud5N4RmaOiokpRhbS+/e7OniCojDr6vQNdXi4sd14Rtv',
  //     'goiRvNAyXUNjT5UPrAQtsqXXu04a7RGfAGg7PJJtg/LfzEzadYOg7LvVa/o/qYP6'
  //   ],
  //   statuses: [
  //     { status: 'ACTIVE', ... },
  //     { status: 'ACTIVE', ... }
  //   ],
  //   indices: [ '2502', '3592' ] }
  const res: {
    publicKeys: string[];
    statuses: ValidatorStatus[];
  } = await fetchGrpc(`/eth/v1alpha1/validator/statuses?${qs}`);
  return res.statuses.reduce(
    (dataByPubkey: { [pubKey: string]: ValidatorStatus }, status, i) => {
      const pubkey = base64ToHex(res.publicKeys[i]);
      return { ...dataByPubkey, [pubkey]: status };
    },
    {}
  );
}

async function ethValidator(publicKey: string): Promise<ValidatorData> {
  const qs = querystring.stringify({ publicKey: hexToBase64(publicKey) });
  return await fetchGrpc(`/eth/v1alpha1/validator?${qs}`);
}

async function ethValidators(
  pubKeys: string[]
): Promise<{ [pubKey: string]: ValidatorData }> {
  const qs = qsPubKeys(pubKeys);
  const res = await fetchGrpc(`/eth/v1alpha1/validators?${qs}`);
  const dataByPubkey: { [pubKey: string]: ValidatorData } = {};
  for (const item of res.validatorList) {
    dataByPubkey[base64ToHex(item.validator.publicKey)] = item.validator;
  }
  return dataByPubkey;
}

export async function ethValidatorsBalances(
  pubKeys: string[]
): Promise<{ [pubKey: string]: ValidatorBalance }> {
  const qs = qsPubKeys(pubKeys);
  const res = await fetchGrpc(`/eth/v1alpha1/validators/balances?${qs}`);

  // Data to obj form
  const dataByPubkey: { [pubKey: string]: ValidatorBalance } = {};
  for (const item of res.balances) {
    dataByPubkey[base64ToHex(item.publicKey)] = { balance: item.balance };
  }
  return dataByPubkey;
}
