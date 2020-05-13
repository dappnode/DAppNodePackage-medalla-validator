import { logs } from "./logs";
import app from "./app";
import { listenToDepositEvents } from "./services/eth1";
import { readKeymanager, validatorBinary } from "./services/validator";
import { migrateLegacyKeys } from "./services/migratePrysmKeys";
import { collectValidatorMetrics } from "./services/metrics";
import { printGitData } from "./services/printGitData";
import { consolidateKeymanagerAccounts } from "./services/accountManager";

// Connect to a Goerli node
listenToDepositEvents();
// Collect latest metrics for available validators
collectValidatorMetrics();
// Migrate keys previously controlled by the validator binary to ethdo
migrateLegacyKeys();
// Makes sure keymanager.json <-> accounts DB accounts are the same
consolidateKeymanagerAccounts();
// For debugging only: print DNP version, git branch and commit
printGitData();

// Start validator binary if ready
if (readKeymanager().accounts.length > 0) validatorBinary.restart();

/**
 * Start Express server.
 */
const port = app.get("port");
const env = app.get("env");
const server = app.listen(app.get("port"), () => {
  logs.info(`App is running at http://localhost:${port} in ${env} mode`);
});

export default server;
