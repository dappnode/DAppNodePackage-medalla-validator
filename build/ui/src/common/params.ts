/**
 * ```js
 * `${eth1Faucet}?address=${address}`
 * ```
 * @param {string} address Accepts URL search param to autofill the tweet URL
 */
export const eth1Faucet = "https://goerli-faucet.dappnode.net/";
export const eth1TxViewer = "https://goerli.etherscan.io/tx/";
export const beaconAccountViewer = "https://beacon.etherscan.io/validator/";
export const validatorCost = 32.1;

// Help links
export const packageAdminConfigPage =
  "http://my.dappnode/#/packages/prysm-altona-validator.public.dappnode.eth/config";

// Beacon node DNPs
export const BEACON_NODE_LIGHTHOUSE = {
  DNPNAME: "lighthouse-medalla-beacon-node",
  REST_APIURL: "http://lighthouse-medalla-beacon-node.dappnode:5052",
};
export const BEACON_NODE_PRYSM = {
  DNPNAME: "prysm-medalla-beacon-node",
  REST_APIURL: "http://prysm-medalla-beacon-node.dappnode:3500",
};
