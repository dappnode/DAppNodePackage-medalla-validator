import path from "path";

export const workdir = process.env.WORKDIR || "/app";
export const dataPath = process.env.DATA_PATH || "/app/data";
export const tlsCert = workdir + "/ssl/ssl.crt";
export const logFile = "/var/log/validator.log";
export const extraOpts = process.env.EXTRA_OPTS || "";
export const verbosity = process.env.VERBOSITY || "info";
export const keymanagerFile = dataPath + "/keymanager.json";
export const beaconRpcProvider =
  process.env.BEACON_GRPC_URL || "prysm-beacon-chain.public.dappnode:4000";

// Login password
export const adminPassword = process.env.PASSWORD;
export const disablePassword = process.env.DISABLE_PASSWORD;

// To collect metrics
export const beaconGrpcGatewayUrl =
  process.env.BEACON_GRPC_GATEWAY_URL ||
  "http://prysm-beacon-chain.public.dappnode:4001";

// Eth1 Deposit contract
export const depositContractAddress =
  "0x5cA1e00004366Ac85f492887AAab12d0e6418876";
export const depositContractCreationBlock = 2523557;
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
