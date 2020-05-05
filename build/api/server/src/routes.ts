import express, { RequestHandler } from "express";
import { wrapRoute } from "./utils/routes";
import { onlyAdmin, loginAdmin, logoutAdmin } from "./auth";
import { Ethdo } from "./ethdo";
import shell from "./utils/shell";

export const api = express.Router();
const get = (path: string, handler: RequestHandler) =>
  api.get(path, wrapRoute(handler));
const post = (path: string, handler: RequestHandler) =>
  api.post(path, wrapRoute(handler));

// Home
get("/", (req, res) => "ethdo account api");

// Auth routes
get("/login", (req, res) => onlyAdmin(req));
post("/login", (req, res) => loginAdmin(req));
get("/logout", (req, res) => logoutAdmin(req));

// Logic routes
const ethdo = new Ethdo(shell);
get("/wallets", async (req, res) => {
  onlyAdmin(req);
  return await ethdo.listAll();
});
post("/wallet", async (req, res) => {
  onlyAdmin(req);
  const { wallet, type, walletpassphrase } = req.body;
  await ethdo.walletCreate({ wallet, type, walletpassphrase });
});
post("/account", async (req, res) => {
  onlyAdmin(req);
  const { account, passphrase, walletpassphrase } = req.body;
  await ethdo.accountCreate({ account, passphrase, walletpassphrase });
});
