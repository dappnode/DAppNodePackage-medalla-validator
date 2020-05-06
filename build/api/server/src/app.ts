import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import compression from "compression";
import path from "path";
import logger from "morgan";
import cors from "cors";
import { api } from "./routes";
// Display stack traces with source-maps
import "source-map-support/register";

const app = express();

const filesPath = path.resolve(process.env.CLIENT_FILES_PATH || "../ui/build");

// Express configuration
app.set("port", process.env.SERVER_PORT || 8080);
app.use(cors()); // default options. ALL CORS
app.use(logger("dev")); // Log requests in "dev" format
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "keyboard cat" // ### Make unique per server
  })
);

// Test jayson

app.use(express.static(filesPath, { maxAge: "1d" })); // Express uses "ETags" (hashes of the files requested) to know when the file changed
app.use("/api", api);
app.get("*", (_0, res) => res.sendFile(path.resolve(filesPath, "index.html"))); // React-router, index.html at all routes

export default app;
