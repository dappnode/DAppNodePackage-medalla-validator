import { logs } from "./logs";
import app from "./app";
import { addValidatorToKeymanager } from "./services/validator";
import { Ethdo } from "./ethdo";
import shell from "./utils/shell";

testEthdo();

async function testEthdo() {
  await new Promise(r => setTimeout(r, 3000));
  const ethdo = new Ethdo(shell);
  const validator = await ethdo.newRandomValidatorAccount();
  addValidatorToKeymanager(validator);
}

/**
 * Start Express server.
 */
const port = app.get("port");
const env = app.get("env");
const server = app.listen(app.get("port"), () => {
  logs.info(`App is running at http://localhost:${port} in ${env} mode`);
});

export default server;
