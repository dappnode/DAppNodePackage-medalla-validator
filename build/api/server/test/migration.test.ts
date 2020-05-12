import "mocha";
import assert from "assert";
import { ethers } from "ethers";
import { decryptPrysmKeystore } from "../src/services/migrations/migratePrysmKeys";

const validatorprivatekeyPath = "/data/validatorprivatekey";
const shardwithdrawalkeyPath = "/data/shardwithdrawalkey";

describe.only("Import accounts controlled by validator to ethdo", () => {
  it("Decrypt validator key", async function() {
    this.timeout(10000);

    const password = "password";
    const keystoreValidator = `{"publickey":"8e4e4a890d62678e9d1695046eb8d6e32203e0aca21f10246f2ded447997ef1506b2d5f0588ebdf997adfe9bf946ac37","crypto":{"cipher":"aes-128-ctr","ciphertext":"57ba3910f06b85f8162f3aa8784daaa3235a5f8826875a4ddd1821fafc6e80f6","cipherparams":{"iv":"9b01f36cdfebcd95849494f0081be075"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"b3f31eee66a76a5e5cf6f9f4f47f5d0fc8002260ecf96d5e72d81981ad9050e2"},"mac":"072d3590e55046030b08db520cbc687c645f6dd292cc960a6f661e56dc4c9688"},"id":"6547def4-7170-4b08-aa53-c84ad0d93e99"}`;
    const expectedPrivateKey =
      "0x2ac2527e3ff205fd2f9212ff6dd2d51a9f1d45220451bfdf17eede2b829adfe3";

    const privateKey = await decryptPrysmKeystore(keystoreValidator, password);

    assert.equal(privateKey, expectedPrivateKey, "Wrong privateKey");
  });

  it("Decrypt withdrawl key", async function() {
    this.timeout(10000);

    const password = "password";
    const keystoreWithdrawl = `{"publickey":"b318b4d5fb94cae426ba5d0a47cbd45e1acd0b49d231c34c48c66674bb88788a75c7468484d74e2e98e9bd0f147b8971","crypto":{"cipher":"aes-128-ctr","ciphertext":"167483ea9a59a1af95f0c94e65bd89907bcc5bf307f9ed7877a7b71202c60cdc","cipherparams":{"iv":"38595537498bb9d95642164c3298b71c"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"3d768457015bd1cfc8226608f5fb4ee0829244850efa1d27c156f9eee69c3a16"},"mac":"e9851dcd50516823783958e0914366cde392fee85080f1f2e9496d03cb419732"},"id":"c5de97bb-6d50-4d06-a737-27f24bc5d147"}`;
    const expectedPrivateKey =
      "0x45d5fc258c53c4cbddbf86055a65eb488368f30c32bbf99192ba09c5a4e6cc48";

    const privateKey = await decryptPrysmKeystore(keystoreWithdrawl, password);

    assert.equal(privateKey, expectedPrivateKey, "Wrong privateKey");
  });
});
