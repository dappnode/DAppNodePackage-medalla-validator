export const dataPath = process.env.DATA_PATH || "data";
export const eth1Web3Url =
  process.env.WEB3PROVIDER || "https://goerli.dappnode.net";
export const GRAFFITI = process.env.GRAFFITI || "";
export const ETH2_NETWORK_NAME = "Medalla testnet";

/**
 * Medalla settings
 */
export const DEPOSIT_CONTRACT_ADDRESS =
  "0x07b39F4fDE4A38bACe212b546dAc87C58DfE3fDC";
export const DEPOSIT_CONTRACT_BLOCK = 3085928;

/**
 * Common keystores stores on disk
 */
export const VALIDATOR_KEYSTORES_DIR = "/validators/keystores";
export const VALIDATOR_SECRETS_DIR = "/validators/secrets";

/**
 * Lighthouse config and paths
 */
export const LIGHTHOUSE_BINARY = "lighthouse";
export const LIGHTHOUSE_DATA_DIR = "/lighthouse";
export const LIGHTHOUSE_KEYSTORES_DIR = "/lighthouse/keystores";
export const LIGHTHOUSE_SECRETS_DIR = "/lighthouse/secrets";
export const LIGHTHOUSE_DNPNAME =
  "lighthouse-medalla-beacon-chain.dnp.dappnode.eth";
export const LIGHTHOUSE_REST_APIURL =
  "http://lighthouse-medalla-beacon-chain.dappnode:5052";
export const LIGHTHOUSE_VALIDATOR_APIURL =
  "http://lighthouse-medalla-beacon-chain.dappnode:5052";
export const LIGHTHOUSE_EXTRA_OPTS = process.env.LIGHTHOUSE_EXTRA_OPTS || "";
export const LIGHTHOUSE_VERBOSITY = process.env.LIGHTHOUSE_VERBOSITY || "info";

/**
 * Prysm config and paths
 */
export const PRYSM_BINARY = "validator";
export const PRYSM_DATA_DIR = "/prysm";
export const PRYSM_WALLET_DIR = "/prysm/.eth2validators/primary";
export const PRYSM_WALLET_PASSWORD_PATH = "/prysm/.eth2validators/primary.pass";
export const PRYSM_LOG_FILE = "/var/log/validator.log";
export const PRYSM_DNPNAME = "prysm-medalla-beacon-chain.dnp.dappnode.eth";
export const PRYSM_REST_APIURL =
  "http://prysm-medalla-beacon-chain.dappnode:3500";
export const PRYSM_VALIDATOR_APIRUL =
  "http://prysm-medalla-beacon-chain.dappnode:4000";
export const PRYSM_EXTRA_OPTS = process.env.PRYSM_EXTRA_OPTS || "";
export const PRYSM_VERBOSITY = process.env.PRYSM_VERBOSITY || "info";

/**
 * DAppNode / DAPPMANAGER params
 */
export const PUBLIC_PACKAGES_APIURL = "http://my.dappnode/public-packages";
export const DMS_DNPNAME = "dms.dnp.dappnode.eth";

// Login password
export const adminPassword = process.env.PASSWORD;
export const disablePassword = process.env.DISABLE_PASSWORD;

// Server config
const logLevel = process.env.LOG_LEVEL;
export const logDebug = logLevel === "debug" || logLevel === "DEBUG";
export const uiFilesPath = process.env.CLIENT_FILES_PATH || "../ui/build";
export const serverPort = process.env.SERVER_PORT || 8080;
export const dbDir = process.env.DB_API_DIR || "db-api";

// Other
export const gitDataPath = process.env.GIT_DATA_PATH;
