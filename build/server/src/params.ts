import path from "path";

export const workdir = process.env.WORKDIR || ".";
export const dataPath = process.env.DATA_PATH || "data";
export const tlsCert = workdir + "/ssl/ssl.crt";
export const logFile = "/var/log/validator.log";
export const extraOpts = process.env.EXTRA_OPTS || "";
export const verbosity = process.env.VERBOSITY || "info";
export const keymanagerFile = dataPath + "/keymanager.json";
export const ethdoKeymanagerFile = dataPath + "ethdoKeymanager.json";
export const ethdoWalletsPath = path.join(dataPath, "wallets");
export const beaconRpcProvider =
  process.env.BEACON_GRPC_URL || "prysm-beacon-chain.public.dappnode:4000";
export const eth1Web3Url =
  process.env.WEB3PROVIDER || "https://goerli.dappnode.net";
export const graffiti = process.env.GRAFFITI || "";
export const eth2NetworkName = process.env.ETH2_NETWORK_NAME || "";

/**
 * Lighthouse config and paths
 */
export const LIGHTHOUSE_DATA_DIR = "/lighthouse";
export const LIGHTHOUSE_KEYSTORES_DIR = "/lighthouse/keystores";
export const LIGHTHOUSE_SECRETS_DIR = "/lighthouse/secrets";

// Login password
export const adminPassword = process.env.PASSWORD;
export const disablePassword = process.env.DISABLE_PASSWORD;

// To collect metrics
export const beaconGrpcGatewayUrl =
  process.env.BEACON_GRPC_GATEWAY_URL ||
  "http://prysm-altona-beacon-chain.dappnode:3500";

// Eth1 Deposit contract
export const depositCallGasLimit = 600000; // Typical value 360k-365k, but with margin since it changes per transaction
export const depositAmountEth = "32.0";

// Legacy account file names
export const legacyPasswordPath = path.join(dataPath, "password");
export const legacyValidatorPath = path.join(dataPath, "validatorprivatekey");
export const legacyWithdrawalPath = path.join(dataPath, "shardwithdrawalkey");

// Server config
export const logLevel = process.env.LOG_LEVEL;
export const logDebug = logLevel === "debug" || logLevel === "DEBUG";
export const uiFilesPath = process.env.CLIENT_FILES_PATH || "../ui/build";
export const serverPort = process.env.SERVER_PORT || 8080;
export const dbDir = process.env.DB_API_DIR || "db-api";

// Other
export const gitDataPath = process.env.GIT_DATA_PATH;
