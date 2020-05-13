import express from "express";
import bodyParser from "body-parser";
import logger from "morgan";
import cors from "cors";
import errorhandler from "errorhandler";
import * as methods from "./methods";
import { getRpcHandler } from "../src/routes/rpc";
// Display stack traces with source-maps
import "source-map-support/register";

const rpcHandler = getRpcHandler(methods);

if (process.env.NODE_ENV !== "development")
  throw Error(`This is a mock server only intended for development`);

const app = express();

// Express configuration
app.set("port", process.env.SERVER_PORT || 8080);
app.use(cors()); // default options. ALL CORS
app.use(logger("dev")); // Log requests in "dev" format
app.use(errorhandler());
app.use(bodyParser.json());
app.post("/rpc", rpcHandler);

app.listen(app.get("port"), () => {
  /* eslint-disable-next-line no-console */
  console.warn(`Mock app listening http://localhost:${app.get("port")}`);
});
