import { logs } from "./logs";
import app from "./app";
import { listenToDepositEvents } from "./services/eth1";
import { readKeymanager, validatorBinary } from "./services/validator";
import { migrateLegacyKeys } from "./services/migratePrysmKeys";
import { collectValidatorMetrics } from "./services/metrics";

if (readKeymanager().accounts.length > 0) validatorBinary.restart();
// Connect to a Goerli node
listenToDepositEvents();
// Collect latest metrics for available validators
collectValidatorMetrics();
// Migrate keys previously controlled by the validator binary to ethdo
migrateLegacyKeys();

/**
 * Start Express server.
 */
const port = app.get("port");
const env = app.get("env");
const server = app.listen(app.get("port"), () => {
  logs.info(`App is running at http://localhost:${port} in ${env} mode`);
});

export default server;
