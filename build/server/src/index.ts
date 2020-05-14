import { logs } from "./logs";
import app from "./app";
import { listenToDepositEvents } from "./services/eth1";
import { readKeymanagerAccounts } from "./services/keymanager";
import { migrateLegacyKeys } from "./services/migratePrysmKeys";
import { collectValidatorMetrics } from "./services/metrics";
import { printGitData } from "./services/printGitData";
import { validatorBinary } from "./services/validatorBinary";

// Connect to a Goerli node
listenToDepositEvents();
// Collect latest metrics for available validators
collectValidatorMetrics();
// Migrate keys previously controlled by the validator binary to ethdo
migrateLegacyKeys();
// For debugging only: print DNP version, git branch and commit
printGitData();

// Start validator binary if ready
if (readKeymanagerAccounts().length > 0) validatorBinary.restart();

/**
 * Start Express server.
 */
const port = app.get("port");
const env = app.get("env");
const server = app.listen(app.get("port"), () => {
  logs.info(`App is running at http://localhost:${port} in ${env} mode`);
});

export default server;
