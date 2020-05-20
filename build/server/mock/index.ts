import express from "express";
import bodyParser from "body-parser";
import logger from "morgan";
import cors from "cors";
import * as methods from "./methods";
import { getRpcHandler } from "../src/utils/rpc";
import { wrapRoute } from "../src/utils/express";
import { serverPort } from "../src/params";
// Display stack traces with source-maps
import "source-map-support/register";

if (process.env.NODE_ENV !== "development")
  throw Error(`This is a mock server only intended for development`);

const app = express();

// Express configuration
app.set("port", serverPort);
app.use(cors()); // default options. ALL CORS
app.use(logger("dev")); // Log requests in "dev" format
app.use(bodyParser.json());
app.post("/rpc", getRpcHandler(methods));

// Auth
app.get(
  "/login",
  wrapRoute(() => {})
);
app.post(
  "/login",
  wrapRoute(() => {})
);
app.get(
  "/logout",
  wrapRoute(() => {})
);

app.listen(app.get("port"), () => {
  /* eslint-disable-next-line no-console */
  console.warn(`Mock app listening http://localhost:${app.get("port")}`);
});
