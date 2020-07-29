/**
 * Name: keystore-m_12381_3600_0_0_0-1595959302.json
 */
export interface Eth2Keystore {
  crypto: object; // { ... }
  description: string; // ""
  pubkey: string; // "b709108cf222c87d64526c393d872961f647f438b483365c14e5c0a26d08862cf06d10e630a71816c1920cb8ac699260",
  path: string; // "m/12381/3600/0/0/0"
  uuid: string; // "deba008c-3b56-4f49-981b-0e62fd6c0171"
  version: number; // 4
}

/**
 * Name: deposit_data-1595959302.json
 */
export interface Eth2Deposit {
  pubkey: string; // "b709108cf222c87d64526c393d872961f647f438b483365c14e5c0a26d08862cf06d10e630a71816c1920cb8ac699260";
  withdrawal_credentials: string; // "0064c79b20681cb57c1daecabb8400526900669ed4a1f94905fabb5795d13f3a";
  amount: number; // 32000000000;
  signature: string; // "b5701e1fb2508d6e02a79c4bad5bbd0ee5b5a05bc5b629bc297e226b3f8db8e7ed1d2ee070d7bd9c9a9cdb7ce93602b9179849c097887a2e91c4d92c02377044c32b0f740ccc7745d6179131b630959407e1f10a00ac9b4d34080ce8ab5a8df4";
  deposit_message_root: string; // "b6b69067410548d177b058dbb91902c55dfe136bbbc354d3ccef8506bfd67d5f";
  deposit_data_root: string; // "a50df4aabd8046393ca7064a2dad1048f0bd3dbc8f79e04dcc663dd1ed07af6d";
  fork_version: string; // "00000001";
}

type Eth2File =
  | { type: "keystore"; keystore: Eth2Keystore }
  | { type: "deposit"; data: Eth2Deposit[] }
  | { type: "passphrase"; pubkey: string; passphrase: string };

export async function processEth2File(file: File): Promise<Eth2File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = () => reject(Error("file reading was aborted"));
    reader.onerror = () => reject(Error("file reading has failed"));
    reader.onload = () => {
      const dataStr = reader.result;
      if (typeof dataStr !== "string") {
        return reject(Error("Data not a string"));
      }
      try {
        let json: any;
        try {
          json = JSON.parse(dataStr);
        } catch (e) {
          // Assume it's plain string
          // Name should be the pubkey of the validator = 0x88f920bb56d76c68e0d983e9772e67d2ba4afadd5eb162a51f7fc62212c138e5611d99f98f834fce43f310295ca35eca
          const pubkey = file.name.replace("0x", "");
          if (isPubkey(pubkey)) {
            return resolve({
              type: "passphrase",
              pubkey,
              passphrase: dataStr,
            });
          }
        }

        if (isEth2Keystore(json))
          return resolve({
            type: "keystore",
            keystore: json,
          });

        if (isEth2Deposit(json))
          return resolve({
            type: "deposit",
            data: [json],
          });

        if (isEth2DepositArray(json))
          return resolve({
            type: "deposit",
            data: json,
          });

        throw Error("Unknown eth2 file type");
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsText(file);
  });
}

function isEth2Keystore(json: Eth2Keystore): boolean {
  return Boolean(json.pubkey && json.crypto);
}

function isEth2Deposit(json: Eth2Deposit): boolean {
  return Boolean(json.pubkey && json.withdrawal_credentials);
}

function isEth2DepositArray(json: Eth2Deposit[]): boolean {
  return Array.isArray(json) && json.every(isEth2Deposit);
}

function isPubkey(s: string): boolean {
  return /^[A-Fa-f0-9]{96}$/.test(s);
}
