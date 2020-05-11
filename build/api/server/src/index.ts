import { logs } from "./logs";
import app from "./app";
import { listenToDepositEvents } from "./services/eth1";
import { readKeymanager, validator } from "./services/validator";

/**
 * Start services
 */
listenToDepositEvents();
if (readKeymanager().accounts.length > 0) validator.restart();

/**
 * Start Express server.
 */
const port = app.get("port");
const env = app.get("env");
const server = app.listen(app.get("port"), () => {
  logs.info(`App is running at http://localhost:${port} in ${env} mode`);
});

export default server;
