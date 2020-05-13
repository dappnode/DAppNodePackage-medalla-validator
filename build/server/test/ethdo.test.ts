import "mocha";
import assert from "assert";
import { Ethdo } from "../src/ethdo";
import {
  WalletAccountData,
  parseWalletAccountsVerbose
} from "../src/ethdo/cmds";
import shell from "../src/utils/shell";
import { logs } from "../src/logs";

const ethdoTestImage = "ethdo_test_image";
const installCmd = "GO111MODULE=on go get github.com/wealdtech/ethdo@latest";

interface EthdoAccount {
  name: string;
  pass: string;
}

interface EthdoWallets {
  name: string;
  pass: string;
  accounts: EthdoAccount[];
}

describe("ethdo module", () => {
  let id: string;
  let ethdo: Ethdo;

  beforeEach("Create docker container to run commands", async function() {
    this.timeout(120 * 1000);
    await createTestImage();
    id = await shell(`docker run -d ${ethdoTestImage} sleep 10m`);
    ethdo = new Ethdo(cmd => execIn(id, cmd));
    const version = await execIn(id, "ethdo version");
    if (!version) throw Error(`ethdo not installed`);
  });

  it("Get deposit data", async function() {
    this.timeout(60 * 1000);

    // Test data

    const walletValidator: EthdoWallets = {
      name: "validator",
      pass: "validator-secret",
      accounts: [
        { name: "1", pass: "validator/1-secret" },
        { name: "2", pass: "validator/2-secret" }
      ]
    };
    const walletWithdrawl: EthdoWallets = {
      name: "withdrawal",
      pass: "withdrawal-secret",
      accounts: [{ name: "primary", pass: "withdrawal/primary-secret" }]
    };
    const wallets = [walletValidator, walletWithdrawl];

    // Create wallets
    for (const { name, pass } of wallets)
      await ethdo.walletCreate({
        wallet: name,
        type: "hd",
        walletpassphrase: pass
      });

    // Create accounts
    for (const wallet of wallets)
      for (const { name, pass } of wallet.accounts)
        await ethdo.accountCreate({
          account: wallet.name + "/" + name,
          passphrase: pass,
          walletpassphrase: wallet.pass
        });

    // Test listing accounts
    const list = await ethdo.listAll();
    assert.deepEqual(
      list,
      wallets.map(({ name, accounts }) => ({
        name,
        accounts: accounts.map(({ name }) => name)
      })),
      "Wrong listed wallets and accounts"
    );

    // Test getting deposit data
    const depositData = await ethdo.validatorDepositdata({
      validatoraccount:
        walletValidator.name + "/" + walletValidator.accounts[0].name,
      withdrawalaccount:
        walletWithdrawl.name + "/" + walletWithdrawl.accounts[0].name,
      depositvalue: "32Ether",
      passphrase: walletValidator.accounts[0].pass,
      raw: true
    });

    logs.info("deposit data");
    logs.info(splitTxByWords(depositData).join("\n"));
    assertDepositData(depositData);
    assert.equal(typeof depositData, "string", "deposit data must be a string");
    assert.equal(
      depositData.length,
      2 + 8 + 13 * 64,
      "wrong deposit data length"
    );
  });

  it("Do UI flow", async () => {
    const account = "Primary";
    const passphrase = "secret-passphrase" + Math.random();
    await ethdo.createAccount({ account, passphrase }, "withdrawl");
    const validator = await ethdo.createAccount({ account: "1" }, "validator");
    const depositData = await ethdo.getDepositData(validator, account);
    logs.info({ validator, depositData });
    assert.equal(validator.account, "validator/1", "unexpected validator name");
    assert.equal(validator.passphrase.length, 64, "wrong rand passhr length");
    assertDepositData(depositData);
  });

  it("List wallet accounts with a private key", async () => {
    const wallet = "withdrawl";
    await ethdo.walletCreate({ wallet });
    const accounts = ["primary", "secondary"].map(name => ({
      account: `${wallet}/${name}`,
      passphrase: "secret-passphrase" + Math.random()
    }));
    for (const account of accounts)
      await ethdo.createAccount(account, "withdrawl");

    const accountList = await ethdo.accountList(wallet);
    assert.deepEqual(
      accounts.map(({ account }) => account).sort(),
      accountList.map(({ id }) => id).sort()
    );
    for (const account of accountList) {
      assert.ok(account.publicKey, "Account should have publicKey");
    }
  });

  afterEach("Remove test container", async () => {
    if (id) await shell(`docker rm -f --volumes ${id}`);
  });
});

describe.only("ethdo parsers", () => {
  describe("wallet accounts verbose", () => {
    const cases: {
      id: string;
      res: string;
      data: WalletAccountData[];
    }[] = [
      {
        id: "Full case",
        res: `2
	UUID:		32ec701a-880b-4cfa-a409-74d88854ec64
	Public key:	0x98552a5cfa4022f529eadafeb0d17c2ed748a42ecd799472dad244ffd21342a7b3e436a38abad1ece8afabfd13b42e60
 1
 	UUID:		7ec09618-c4df-46de-87bf-ecd6da8a580e
 	Public key:	0x8498e2c928c5c6718157720239b0cf9968fbbcdf7893a5f46b32c70bd66390c2f6546263aa596a3a09b4447aa8b676fc
 3
  UUID:		972483d5-19f7-419e-8f48-3858daea1ca0
	Public key:	0x98d2f1a38682dc4c3bd3ad1a28411d9507dd6423f8af6bcb9f3d827b7d309c8910825b6523359651a9b1ec16a754c2e4`,
        data: [
          {
            name: "2",
            uuid: "32ec701a-880b-4cfa-a409-74d88854ec64",
            publicKey:
              "0x98552a5cfa4022f529eadafeb0d17c2ed748a42ecd799472dad244ffd21342a7b3e436a38abad1ece8afabfd13b42e60"
          },
          {
            name: "1",
            uuid: "7ec09618-c4df-46de-87bf-ecd6da8a580e",
            publicKey:
              "0x8498e2c928c5c6718157720239b0cf9968fbbcdf7893a5f46b32c70bd66390c2f6546263aa596a3a09b4447aa8b676fc"
          },
          {
            name: "3",
            uuid: "972483d5-19f7-419e-8f48-3858daea1ca0",
            publicKey:
              "0x98d2f1a38682dc4c3bd3ad1a28411d9507dd6423f8af6bcb9f3d827b7d309c8910825b6523359651a9b1ec16a754c2e4"
          }
        ]
      },
      {
        id: "Single account",
        res: `Primary
	UUID:		32ec701a-880b-4cfa-a409-74d88854ec64
	Public key:	0x98552a5cfa4022f529eadafeb0d17c2ed748a42ecd799472dad244ffd21342a7b3e436a38abad1ece8afabfd13b42e60`,
        data: [
          {
            name: "Primary",
            uuid: "32ec701a-880b-4cfa-a409-74d88854ec64",
            publicKey:
              "0x98552a5cfa4022f529eadafeb0d17c2ed748a42ecd799472dad244ffd21342a7b3e436a38abad1ece8afabfd13b42e60"
          }
        ]
      },
      {
        id: "Empty response",
        res: "",
        data: []
      }
    ];

    for (const { id, res, data } of cases) {
      it(`Parse ${id} output`, () => {
        const dataResult = parseWalletAccountsVerbose(res);
        console.log(dataResult);
        assert.deepEqual(dataResult, data, "Wrong data");
      });
    }
  });
});

/**
 * Util to assert dynamically generated deposit data
 * @param depositData
 */
function assertDepositData(depositData: string): void {
  assert.equal(typeof depositData, "string", "deposit data must be a string");
  assert.equal(
    depositData.length,
    2 + 8 + 13 * 64,
    "wrong deposit data length"
  );
}

/**
 * Util: split raw transaction data by words for better diffing
 * @param data "0xaaaa...00...00...11..."
 * @returns [
 *   0xaaaa...
 *   00...
 *   00...
 *   11...
 * ]
 */
function splitTxByWords(data: string): string[] {
  const selector = data.slice(0, 10);
  const words = data.slice(10).match(/.{1,64}/g);
  return [selector, ...(words || [])];
}

/**
 * Use this format to have visibility of the body in case it fails
 * @param res
 * @param code
 * @param body
 */
async function execIn(id: string, cmd: string) {
  if (!id) throw Error(`No test containerId set`);
  try {
    return await shell(`docker exec ${id} /bin/bash -c "${cmd}"`);
  } catch (e) {
    // Return detailed info
    throw Error(`${e.message}
  code: ${e.code} ${e.signal || ""}
  stdout: ${e.stdout}
  stderr: ${e.stderr}`);
  }
}

/**
 * Create and commit a docker image with ethdo installed to reuse in all tests
 */
async function createTestImage() {
  const exists = await shell(`docker images -q ${ethdoTestImage}`);
  if (exists) return;
  logs.info(`Creating test image ${ethdoTestImage}, may take a while...`);

  const id = await shell(`docker run -d golang sleep 10m`);
  await execIn(id, installCmd);

  const version = await execIn(id, "ethdo version");
  if (!version) throw Error(`ethdo not installed`);

  await shell(`docker commit ${id} ${ethdoTestImage}`);
  await shell(`docker rm -f --volumes ${id}`);
  logs.info(`Created test image ${ethdoTestImage} from container ${id}`);
}
